const express = require("express");
const router = express.Router();
const pool = require("../db"); // Ton fichier de connexion MySQL
const jwt = require("jsonwebtoken");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Middleware d'authentification
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'Apres_lheure_cest_plus_lheure_franchement');

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

    // 1. Créer les réservations
    for (const item of spectacles) {
      const [result] = await conn.query(
        "INSERT INTO reservation (user_id, spectacle_id, nb_places) VALUES (?, ?, ?)",
        [user_id, item.id, item.billets]
      );
      reservationIds.push(result.insertId);
    }

    // 2. Créer le paiement global avec l'ID de session Stripe
    const [paiementResult] = await conn.query(
      "INSERT INTO paiement (montant, statut, session_id) VALUES (?, ?, ?)",
      [session.amount_total / 100, true, session.id] // Stripe retourne les montants en centimes
    );
    const paiementId = paiementResult.insertId;

    // 3. Répartir le paiement sur les réservations
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
    console.log(`Paiement traité avec succès pour la session: ${session.id}`);

  } catch (err) {
    await conn.rollback();
    console.error("Erreur lors du traitement du paiement:", err);
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
    console.log(`Réservation annulée enregistrée pour la session: ${session.id}`);

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

    // Créer une session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-status?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-status?payment=cancel`,
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
    res.status(500).json({ error: "Erreur serveur lors de la création du paiement." });
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
    
    // 1. Enregistrer chaque réservation
    for (const item of spectacles) {
      const [result] = await conn.query(
        "INSERT INTO reservation (user_id, spectacle_id, nb_places) VALUES (?, ?, ?)",
        [user_id, item.id, item.billets]
      );
      reservationIds.push(result.insertId);
    }

    // 2. Créer un paiement global
    const [paiementResult] = await conn.query(
      "INSERT INTO paiement (montant, statut) VALUES (?, ?)",
      [montant, true]
    );
    const paiementId = paiementResult.insertId;

    // 3. Répartir le paiement proportionnellement sur les réservations
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
  
  try {
    // Vérifier la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
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
    console.error("Erreur lors de la vérification du statut:", error);
    res.status(500).json({ error: "Erreur lors de la vérification du statut" });
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

// Récupérer les réservations d'un utilisateur
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  
  try {
    const [reservations] = await pool.query(`
      SELECT 
        r.id as reservation_id,
        r.nb_places,
        r.date as reservation_date,
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

module.exports = router;
