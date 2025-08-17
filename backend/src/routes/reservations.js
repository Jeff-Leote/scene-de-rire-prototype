const express = require("express");
const router = express.Router();
const pool = require("../db"); // Ton fichier de connexion MySQL
const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Vérification de la configuration Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("ERREUR: STRIPE_SECRET_KEY n'est pas configurée dans les variables d'environnement");
}

// Configuration Stripe avec gestion d'erreur
let stripe;
try {
  stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  console.log("✅ Configuration Stripe réussie");
} catch (error) {
  console.error("❌ Erreur lors de l'initialisation de Stripe:", error.message);
  // En mode développement, utiliser une clé de test par défaut
  if (process.env.NODE_ENV === 'development') {
    console.warn("⚠️ Mode développement: utilisation d'une clé de test par défaut");
    stripe = require("stripe")("sk_test_4eC39HqLyjWDarjtT1zdp7dc");
  } else {
    throw new Error("Configuration Stripe invalide en production");
  }
}

// Fonction pour générer un QR code unique pour une réservation
async function generateQRCode(reservationId, spectacleId, spectacleTitle) {
  try {
    // Créer les données de validation du ticket
    const ticketData = {
      reservation_id: reservationId,
      spectacle_id: spectacleId,
      spectacle_title: spectacleTitle,
      type: "ticket_validation",
      timestamp: new Date().toISOString()
    };

    // Générer le nom du fichier
    const fileName = `reservation_${reservationId}_${Date.now()}.png`;
    const qrDir = path.join(__dirname, '../../qrcodes');
    const qrPath = path.join(qrDir, fileName);

    // Créer le dossier qrcodes s'il n'existe pas
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
      console.log('📁 Dossier qrcodes créé:', qrDir);
    }

    // Générer le QR code avec les données JSON
    await QRCode.toFile(qrPath, JSON.stringify(ticketData), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    console.log('✅ QR code généré:', fileName);
    return fileName; // Retourner le nom du fichier pour le stocker en base
  } catch (error) {
    console.error("❌ Erreur lors de la génération du QR code:", error);
    throw error;
  }
}

// Fonction pour vérifier la disponibilité des places
async function checkAvailability(spectacleId, nbPlaces) {
  const conn = await pool.getConnection();
  try {
    // Récupérer le nombre de places disponibles pour ce spectacle
    const [spectacleRows] = await conn.query(
      "SELECT places_disponibles FROM spectacle WHERE id = ?",
      [spectacleId]
    );

    if (spectacleRows.length === 0) {
      throw new Error("Spectacle non trouvé");
    }

    const placesDisponibles = spectacleRows[0].places_disponibles;

    // Compter les réservations existantes pour ce spectacle
    const [reservationsRows] = await conn.query(
      "SELECT SUM(nb_places) as total_reserve FROM reservation WHERE spectacle_id = ?",
      [spectacleId]
    );

    const totalReserve = reservationsRows[0].total_reserve || 0;
    const placesRestantes = placesDisponibles - totalReserve;

    if (nbPlaces > placesRestantes) {
      throw new Error(`Il ne reste que ${placesRestantes} place(s) disponible(s) pour ce spectacle`);
    }

    return placesRestantes;
  } finally {
    conn.release();
  }
}

// Middleware d'authentification
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [users] = await pool.query('SELECT * FROM user WHERE id = ?', [decoded.id]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};



// Fonction pour gérer un paiement réussi
async function handleSuccessfulPayment(session) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Récupérer les métadonnées de la session
    const { prenom, nom, cart, user_id } = session.metadata;
    const spectacles = JSON.parse(cart);

    const reservationIds = [];

    // 1. Vérifier la disponibilité des places pour tous les spectacles
    for (const item of spectacles) {
      await checkAvailability(item.id, item.billets);
    }

    // 2. Récupérer les détails des spectacles pour les QR codes
    const spectacleIds = spectacles.map(s => s.id);
    const [spectacleRows] = await conn.query(
      "SELECT id, title FROM spectacle WHERE id IN (?)",
      [spectacleIds]
    );
    
    const spectacleDetails = {};
    spectacleRows.forEach(row => {
      spectacleDetails[row.id] = { title: row.title };
    });

    // 3. Créer les réservations avec QR codes
    for (const item of spectacles) {
      const [result] = await conn.query(
        "INSERT INTO reservation (user_id, spectacle_id, nb_places) VALUES (?, ?, ?)",
        [user_id, item.id, item.billets]
      );
      const reservationId = result.insertId;
      reservationIds.push(reservationId);

      // Générer le QR code pour cette réservation
      const spectacleTitle = spectacleDetails[item.id].title;
      const qrFileName = await generateQRCode(reservationId, item.id, spectacleTitle);
      
      // Mettre à jour la réservation avec le chemin du QR code
      await conn.query(
        "UPDATE reservation SET qr_code_path = ? WHERE id = ?",
        [qrFileName, reservationId]
      );
    }

    // 4. Créer le paiement global avec l'ID de session Stripe
    const [paiementResult] = await conn.query(
      "INSERT INTO paiement (montant, statut, session_id) VALUES (?, ?, ?)",
      [session.amount_total / 100, true, session.id] // Stripe retourne les montants en centimes
    );
    const paiementId = paiementResult.insertId;

    // 5. Répartir le paiement sur les réservations
    const totalBillets = spectacles.reduce((sum, item) => sum + item.billets, 0);
    const amountPerTicket = (session.amount_total / 100) / totalBillets;

    for (let i = 0; i < reservationIds.length; i++) {
      const reservation_id = reservationIds[i];
      const spectacleAmount = Math.round(amountPerTicket * spectacles[i].billets);
      await conn.query(
        "INSERT INTO paiement_reservation (paiement_id, reservation_id, montant) VALUES (?, ?, ?)",
        [paiementId, reservation_id, spectacleAmount]
      );
    }

    await conn.commit();


  } catch (err) {
    await conn.rollback();
    console.error("Erreur lors du traitement du paiement:", err);
    throw err; // Propager l'erreur pour la gérer dans la route
  } finally {
    conn.release();
  }
}

// Fonction pour gérer une réservation annulée
async function handleCancelledReservation(session) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Récupérer les métadonnées de la session
    const { prenom, nom, cart, user_id, total } = session.metadata;
    const spectacles = JSON.parse(cart);

    const reservationIds = [];

    // 1. Créer les réservations (même en cas d'annulation)
    for (const item of spectacles) {
      const [result] = await conn.query(
        "INSERT INTO reservation (user_id, spectacle_id, nb_places) VALUES (?, ?, ?)",
        [user_id, item.id, item.billets]
      );
      reservationIds.push(result.insertId);
    }

    // 2. Créer le paiement global avec statut false (échec)
    const [paiementResult] = await conn.query(
      "INSERT INTO paiement (montant, statut, session_id) VALUES (?, ?, ?)",
      [parseFloat(total), false, session.id]
    );
    const paiementId = paiementResult.insertId;

    // 3. Répartir le montant sur les réservations
    const totalBillets = spectacles.reduce((sum, item) => sum + item.billets, 0);
    const amountPerTicket = parseFloat(total) / totalBillets;

    for (let i = 0; i < reservationIds.length; i++) {
      const reservation_id = reservationIds[i];
      const spectacleAmount = Math.round(amountPerTicket * spectacles[i].billets);
      await conn.query(
        "INSERT INTO paiement_reservation (paiement_id, reservation_id, montant) VALUES (?, ?, ?)",
        [paiementId, reservation_id, spectacleAmount]
      );
    }

    await conn.commit();


  } catch (err) {
    await conn.rollback();
    console.error("Erreur lors de l'enregistrement de la réservation annulée:", err);
  } finally {
    conn.release();
  }
}

// Créer une session de paiement (checkout)
router.post("/checkout", auth, async (req, res) => {
  const { spectacles, email, prenom, nom } = req.body;

  if (!spectacles || !Array.isArray(spectacles) || spectacles.length === 0) {
    return res.status(400).json({ error: "Le panier est vide ou invalide." });
  }

  try {
    // Vérifier la disponibilité des places avant de créer la session Stripe
    for (const item of spectacles) {
      try {
        await checkAvailability(item.id, item.billets);
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
    }

    const spectacleIds = spectacles.map(s => s.id);
    const [rows] = await pool.query(
      "SELECT id, title, prix FROM spectacle WHERE id IN (?)",
      [spectacleIds]
    );

    const spectaclesDetails = {};
    rows.forEach(row => {
      spectaclesDetails[row.id] = { title: row.title, prix: row.prix };
    });

    // Calculer le total
    let total = 0;
    const lineItems = [];
    for (const item of spectacles) {
      const spectacleDetail = spectaclesDetails[item.id];
      if (!spectacleDetail) {
        throw new Error(`Spectacle avec id ${item.id} non trouvé.`);
      }
      total += spectacleDetail.prix * item.billets;
      
      // Ajouter l'item pour Stripe
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: spectacleDetail.title,
            description: `${item.billets} billet(s)`,
          },
          unit_amount: spectacleDetail.prix * 100, // Stripe utilise les centimes
        },
        quantity: item.billets,
      });
    }

    // Déterminer l'URL du frontend selon l'environnement
    let frontendUrl;
    if (process.env.NODE_ENV === 'production') {
      frontendUrl = 'https://espacecomedie.fr';
    } else {
      frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    }
    
    console.log('🌐 URL du frontend configurée:', frontendUrl);
    console.log('🔧 Mode d\'environnement:', process.env.NODE_ENV);

    // Créer une session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${frontendUrl}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${frontendUrl}/?payment=cancel`,
      metadata: {
        user_id: req.user.id.toString(),
        prenom: prenom,
        nom: nom,
        email: email,
        cart: JSON.stringify(spectacles),
        total: total.toString()
      },
      customer_email: email,
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error("Erreur lors de la création de la session Stripe:", error);
    
    // Vérifier si c'est un problème de configuration Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ 
        error: "Erreur de configuration Stripe",
        details: "La clé secrète Stripe n'est pas configurée"
      });
    }
    
    // Vérifier si c'est un problème avec l'URL du frontend
    if (!process.env.FRONTEND_URL && process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ 
        error: "Erreur de configuration",
        details: "L'URL du frontend n'est pas configurée"
      });
    }
    
    // Gestion spécifique des erreurs Stripe
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ 
        error: "Erreur de configuration Stripe",
        details: "Vérifiez que votre clé Stripe est valide"
      });
    }
    
    res.status(500).json({ 
      error: "Erreur serveur lors de la création du paiement",
      details: error.message 
    });
  }
});

// Créer une réservation (à compléter avec Stripe ensuite)
router.post("/", async (req, res) => {
  const { user_id, spectacle_id, nb_places } = req.body;
  if (!user_id || !spectacle_id || !nb_places) {
    return res.status(400).json({ error: "Champs manquants" });
  }
  try {
    const [result] = await pool.query(
      "INSERT INTO reservation (user_id, spectacle_id, nb_places) VALUES (?, ?, ?)",
      [user_id, spectacle_id, nb_places]
    );
    res.status(201).json({ reservation_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la création de la réservation" });
  }
});

// Confirmation de réservation et paiement après succès Stripe
router.post("/confirm", async (req, res) => {
  const { user_id, spectacles, session_id, montant } = req.body;
  // spectacles: [{ id, billets }]
  // montant: total payé
  if (!user_id || !spectacles || !Array.isArray(spectacles) || !session_id) {
    return res.status(400).json({ error: "Champs manquants" });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const reservationIds = [];
    
    // 1. Vérifier la disponibilité des places pour tous les spectacles
    for (const item of spectacles) {
      await checkAvailability(item.id, item.billets);
    }

    // 2. Récupérer les détails des spectacles pour les QR codes
    const spectacleIds = spectacles.map(s => s.id);
    const [spectacleRows] = await conn.query(
      "SELECT id, title FROM spectacle WHERE id IN (?)",
      [spectacleIds]
    );
    
    const spectacleDetails = {};
    spectacleRows.forEach(row => {
      spectacleDetails[row.id] = { title: row.title };
    });
    
    // 3. Enregistrer chaque réservation avec QR codes
    for (const item of spectacles) {
      const [result] = await conn.query(
        "INSERT INTO reservation (user_id, spectacle_id, nb_places) VALUES (?, ?, ?)",
        [user_id, item.id, item.billets]
      );
      const reservationId = result.insertId;
      reservationIds.push(reservationId);

      // Générer le QR code pour cette réservation
      const spectacleTitle = spectacleDetails[item.id].title;
      const qrFileName = await generateQRCode(reservationId, item.id, spectacleTitle);
      
      // Mettre à jour la réservation avec le chemin du QR code
      await conn.query(
        "UPDATE reservation SET qr_code_path = ? WHERE id = ?",
        [qrFileName, reservationId]
      );
    }

    // 4. Créer un paiement global
    const [paiementResult] = await conn.query(
      "INSERT INTO paiement (montant, statut, session_id) VALUES (?, ?, ?)",
      [montant, true, session_id]
    );
    const paiementId = paiementResult.insertId;

    // 5. Répartir le paiement proportionnellement sur les réservations
    const totalSpectacles = spectacles.reduce((sum, item) => sum + item.billets, 0);
    const amountPerTicket = montant / totalSpectacles;
    
    for (let i = 0; i < reservationIds.length; i++) {
      const reservation_id = reservationIds[i];
      const spectacleAmount = Math.round(amountPerTicket * spectacles[i].billets);
      await conn.query(
        "INSERT INTO paiement_reservation (paiement_id, reservation_id, montant) VALUES (?, ?, ?)",
        [paiementId, reservation_id, spectacleAmount]
      );
    }

    await conn.commit();
    res.status(201).json({ success: true, paiement_id: paiementId, reservations: reservationIds });
  } catch (err) {
    await conn.rollback();
    console.error("Erreur lors de la confirmation de la réservation:", err);
    res.status(500).json({ 
      error: "Erreur lors de la confirmation de la réservation", 
      details: err.message 
    });
  } finally {
    conn.release();
  }
});

// Vérifier le statut d'un paiement
router.get("/status/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  
  console.log('🔍 Vérification du statut pour sessionId:', sessionId);
  console.log('🔑 STRIPE_SECRET_KEY configurée:', !!process.env.STRIPE_SECRET_KEY);
  
  try {
    // Vérifier la session Stripe
    console.log('📞 Appel à Stripe pour récupérer la session...');
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('✅ Session Stripe récupérée:', {
      id: session.id,
      payment_status: session.payment_status,
      amount_total: session.amount_total
    });
    
    if (session.payment_status === 'paid') {
      // Vérifier si les réservations ont déjà été créées
      const conn = await pool.getConnection();
      try {
        const [paiements] = await conn.query(
          "SELECT p.*, pr.reservation_id FROM paiement p JOIN paiement_reservation pr ON p.id = pr.paiement_id WHERE p.session_id = ?",
          [sessionId]
        );
        
        if (paiements.length > 0) {
          res.json({ 
            status: 'paid', 
            message: 'Paiement confirmé et réservation créée',
            sessionId: sessionId 
          });
        } else {
          // Créer les réservations si elles n'existent pas encore
          await handleSuccessfulPayment(session);
          res.json({ 
            status: 'paid', 
            message: 'Paiement confirmé et réservation créée',
            sessionId: sessionId 
          });
        }
      } finally {
        conn.release();
      }
    } else if (session.payment_status === 'unpaid') {
      res.json({ 
        status: 'failed', 
        message: 'Paiement échoué',
        sessionId: sessionId 
      });
    } else {
      res.json({ 
        status: 'pending', 
        message: 'Paiement en cours de traitement...',
        sessionId: sessionId 
      });
    }
  } catch (error) {
    console.error("❌ Erreur lors de la vérification du statut:", error);
    console.error("📋 Détails de l'erreur:", {
      name: error.name,
      message: error.message,
      code: error.code,
      type: error.type
    });
    res.status(500).json({ 
      error: "Erreur lors de la vérification du statut",
      details: error.message 
    });
  }
});

// Gérer une réservation annulée
router.post("/cancel", async (req, res) => {
  const { sessionId } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ error: "Session ID manquant" });
  }

  try {
    // Récupérer la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Vérifier si les réservations ont déjà été créées pour cette session
    const conn = await pool.getConnection();
    try {
      const [paiements] = await conn.query(
        "SELECT p.*, pr.reservation_id FROM paiement p JOIN paiement_reservation pr ON p.id = pr.paiement_id WHERE p.session_id = ?",
        [sessionId]
      );
      
      if (paiements.length === 0) {
        // Créer les réservations annulées si elles n'existent pas encore
        await handleCancelledReservation(session);
      }
      
      res.json({ 
        status: 'cancelled', 
        message: 'Réservation annulée enregistrée',
        sessionId: sessionId 
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la réservation annulée:", error);
    res.status(500).json({ error: "Erreur lors de l'enregistrement de la réservation annulée" });
  }
});

// Récupérer le QR code d'une réservation
router.get("/:reservationId/qrcode", auth, async (req, res) => {
  const { reservationId } = req.params;
  
  try {
    // Vérifier que la réservation appartient à l'utilisateur connecté
    const [reservations] = await pool.query(`
      SELECT r.qr_code_path, r.nb_places, s.title, s.date_spectacle, s.heure_spectacle
      FROM reservation r
      JOIN spectacle s ON r.spectacle_id = s.id
      WHERE r.id = ? AND r.user_id = ?
    `, [reservationId, req.user.id]);

    if (reservations.length === 0) {
      return res.status(404).json({ error: "Réservation non trouvée ou non autorisée" });
    }

    const reservation = reservations[0];
    
    if (!reservation.qr_code_path) {
      return res.status(404).json({ error: "QR code non trouvé pour cette réservation" });
    }

    const qrPath = path.join(__dirname, '../../qrcodes', reservation.qr_code_path);
    
    // Vérifier que le fichier existe
    if (!fs.existsSync(qrPath)) {
      return res.status(404).json({ error: "Fichier QR code non trouvé" });
    }

    // Envoyer le fichier QR code
    res.sendFile(qrPath);
    
  } catch (error) {
    console.error("Erreur lors de la récupération du QR code:", error);
    res.status(500).json({ error: "Erreur lors de la récupération du QR code" });
  }
});

// Récupérer les réservations d'un utilisateur
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  
  try {
    const [reservations] = await pool.query(`
      SELECT 
        r.id as reservation_id,
        r.nb_places,
        r.date as reservation_date,
        COALESCE(r.qr_code_path, NULL) as qr_code_path,
        s.id as spectacle_id,
        s.title,
        s.description,
        s.date_spectacle,
        s.heure_spectacle,
        s.prix,
        s.lieu,
        s.img,
        a.name as artiste_name,
        a.photo as artiste_photo,
        p.montant as montant_paye,
        p.statut as paiement_statut,
        p.date as date_paiement
      FROM reservation r
      JOIN spectacle s ON r.spectacle_id = s.id
      JOIN artiste a ON s.artiste_id = a.id
      LEFT JOIN paiement_reservation pr ON r.id = pr.reservation_id
      LEFT JOIN paiement p ON pr.paiement_id = p.id
      WHERE r.user_id = ?
      ORDER BY r.date DESC
    `, [userId]);

    res.json({ 
      success: true, 
      reservations: reservations 
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error);
    res.status(500).json({ 
      error: "Erreur lors de la récupération des réservations",
      details: error.message 
    });
  }
});



// Vérifier la disponibilité des places d'un spectacle
router.get("/availability/:spectacleId", async (req, res) => {
  const { spectacleId } = req.params;
  
  try {
    const [spectacleRows] = await pool.query(
      "SELECT places_disponibles, title FROM spectacle WHERE id = ?",
      [spectacleId]
    );

    if (spectacleRows.length === 0) {
      return res.status(404).json({ error: "Spectacle non trouvé" });
    }

    const spectacle = spectacleRows[0];

    // Compter les réservations existantes
    const [reservationsRows] = await pool.query(
      "SELECT SUM(nb_places) as total_reserve FROM reservation WHERE spectacle_id = ?",
      [spectacleId]
    );

    const totalReserve = reservationsRows[0].total_reserve || 0;
    const placesRestantes = spectacle.places_disponibles - totalReserve;

    res.json({
      spectacle_id: parseInt(spectacleId),
      spectacle_title: spectacle.title,
      places_total: spectacle.places_disponibles,
      places_reservees: totalReserve,
      places_restantes: placesRestantes,
      disponible: placesRestantes > 0
    });

  } catch (error) {
    console.error("Erreur lors de la vérification de la disponibilité:", error);
    res.status(500).json({ error: "Erreur lors de la vérification de la disponibilité" });
  }
});

// Valider un ticket (route publique pour la validation)
router.get("/validate/:reservationId", async (req, res) => {
  const { reservationId } = req.params;
  
  try {
    const [reservations] = await pool.query(`
      SELECT 
        r.id as reservation_id,
        r.nb_places,
        r.date as reservation_date,
        r.qr_code_path,
        s.id as spectacle_id,
        s.title,
        s.description,
        s.date_spectacle,
        s.heure_spectacle,
        s.prix,
        s.lieu,
        s.img,
        a.name as artiste_name,
        a.photo as artiste_photo,
        p.montant as montant_paye,
        p.statut as paiement_statut,
        p.date as date_paiement,
        u.nom as user_nom,
        u.prenom as user_prenom,
        u.email as user_email
      FROM reservation r
      JOIN spectacle s ON r.spectacle_id = s.id
      JOIN artiste a ON s.artiste_id = a.id
      JOIN user u ON r.user_id = u.id
      LEFT JOIN paiement_reservation pr ON r.id = pr.reservation_id
      LEFT JOIN paiement p ON pr.paiement_id = p.id
      WHERE r.id = ?
    `, [reservationId]);

    if (reservations.length === 0) {
      return res.status(404).json({ 
        valid: false, 
        error: "Ticket non trouvé" 
      });
    }

    const reservation = reservations[0];

    // Vérifier si le paiement a été effectué
    if (!reservation.paiement_statut || (reservation.paiement_statut !== 'completed' && reservation.paiement_statut !== 1)) {
      return res.json({
        valid: false,
        error: "Paiement non effectué",
        reservation: {
          id: reservation.reservation_id,
          spectacle_title: reservation.title,
          date_spectacle: reservation.date_spectacle,
          heure_spectacle: reservation.heure_spectacle,
          lieu: reservation.lieu,
          nb_places: reservation.nb_places,
          user_nom: reservation.user_nom,
          user_prenom: reservation.user_prenom
        }
      });
    }

    // Vérifier si le spectacle n'est pas déjà passé
    const spectacleDate = new Date(reservation.date_spectacle + ' ' + reservation.heure_spectacle);
    const now = new Date();
    
    if (spectacleDate < now) {
      return res.json({
        valid: false,
        error: "Ce spectacle a déjà eu lieu",
        reservation: {
          id: reservation.reservation_id,
          spectacle_title: reservation.title,
          date_spectacle: reservation.date_spectacle,
          heure_spectacle: reservation.heure_spectacle,
          lieu: reservation.lieu,
          nb_places: reservation.nb_places,
          user_nom: reservation.user_nom,
          user_prenom: reservation.user_prenom
        }
      });
    }

    res.json({
      valid: true,
      message: "Ticket valide",
      reservation: {
        id: reservation.reservation_id,
        spectacle_title: reservation.title,
        date_spectacle: reservation.date_spectacle,
        heure_spectacle: reservation.heure_spectacle,
        lieu: reservation.lieu,
        nb_places: reservation.nb_places,
        user_nom: reservation.user_nom,
        user_prenom: reservation.user_prenom,
        artiste_name: reservation.artiste_name,
        prix: reservation.prix,
        montant_paye: reservation.montant_paye
      }
    });

  } catch (error) {
    console.error("Erreur lors de la validation du ticket:", error);
    res.status(500).json({ 
      valid: false,
      error: "Erreur lors de la validation du ticket" 
    });
  }
});

// (Supprimé) Routes alternatives statiques de debug pour servir les QR codes

module.exports = router;
