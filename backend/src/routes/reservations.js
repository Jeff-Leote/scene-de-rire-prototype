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

// Fonction pour générer un QR code unique pour un ticket
async function generateTicketQRCode(ticketId, reservationId, spectacleId, spectacleTitle) {
  try {
    // Créer les données de validation du ticket
    const ticketData = {
      ticket_id: ticketId,
      reservation_id: reservationId,
      spectacle_id: spectacleId,
      spectacle_title: spectacleTitle,
      type: "ticket_validation",
      timestamp: new Date().toISOString()
    };

    // Générer le nom du fichier
    const fileName = `ticket_${ticketId}_${Date.now()}.png`;
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

    console.log('✅ QR code généré (ticket):', fileName);
    return fileName; // Retourner le nom du fichier pour le stocker en base
  } catch (error) {
    console.error("❌ Erreur lors de la génération du QR code (ticket):", error);
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

    // 3. Créer les réservations et générer 1 ticket (donc 1 QR) par place
    for (const item of spectacles) {
      const [result] = await conn.query(
        "INSERT INTO reservation (user_id, spectacle_id, nb_places) VALUES (?, ?, ?)",
        [user_id, item.id, item.billets]
      );
      const reservationId = result.insertId;
      reservationIds.push(reservationId);
      const spectacleTitle = spectacleDetails[item.id].title;

      // S'assurer que la table ticket existe
      await conn.query(`CREATE TABLE IF NOT EXISTS ticket (
        id INT PRIMARY KEY AUTO_INCREMENT,
        reservation_id INT NOT NULL,
        qr_code_path VARCHAR(255) NULL,
        used BOOLEAN DEFAULT FALSE,
        used_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_reservation_id (reservation_id),
        FOREIGN KEY (reservation_id) REFERENCES reservation(id)
      )`);

      // Générer un ticket par place
      for (let i = 0; i < item.billets; i++) {
        const [ticketRes] = await conn.query(
          "INSERT INTO ticket (reservation_id) VALUES (?)",
          [reservationId]
        );
        const ticketId = ticketRes.insertId;
        const qrFileName = await generateTicketQRCode(ticketId, reservationId, item.id, spectacleTitle);
        await conn.query(
          "UPDATE ticket SET qr_code_path = ? WHERE id = ?",
          [qrFileName, ticketId]
        );
      }
    }

    // 4. Incrémenter le compteur d'utilisations du code promo si utilisé
    if (session.metadata.promo_code) {
      await conn.query(`
        UPDATE promo_codes 
        SET current_uses = current_uses + 1 
        WHERE code = ?
      `, [session.metadata.promo_code]);
    }

    // 5. Créer le paiement global avec l'ID de session Stripe
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

    // 6. Envoyer les tickets par email (HTML brandé + images inline + pièces jointes)
    try {
      const { sendEmail } = require('../services/emailService');
      const [rows] = await pool.query(
        `SELECT 
           t.id            AS ticket_id,
           t.qr_code_path  AS qr_code_path,
           r.id            AS reservation_id,
           r.nb_places     AS nb_places,
           s.title         AS spectacle_title,
           s.date_spectacle AS date_spectacle,
           s.heure_spectacle AS heure_spectacle,
           s.lieu          AS lieu
         FROM ticket t
         JOIN reservation r ON t.reservation_id = r.id
         JOIN spectacle s   ON r.spectacle_id = s.id
         WHERE r.id IN (?)
         ORDER BY r.id, t.id`,
        [reservationIds]
      );

      const prenom = session.metadata?.prenom || '';
      const nom = session.metadata?.nom || '';
      const toEmail = session.customer_details?.email || session.customer_email || session.metadata?.email;

      // Préparer attachments avec contentId pour affichage inline
      const attachments = (rows || [])
        .filter(r => !!r.qr_code_path)
        .map(r => ({
          filename: `ticket_${r.ticket_id}.png`,
          path: path.join(__dirname, '../../qrcodes', r.qr_code_path),
          cid: `ticket_${r.ticket_id}`
        }));

      // Construire le contenu HTML brandé listant les tickets
      const groupByReservation = new Map();
      for (const r of rows || []) {
        if (!groupByReservation.has(r.reservation_id)) groupByReservation.set(r.reservation_id, []);
        groupByReservation.get(r.reservation_id).push(r);
      }

      let messageHtml = `
        <div style="font-family:Arial,sans-serif">
          <p style="margin:0 0 16px 0;color:#111">Bonjour ${prenom} ${nom},</p>
          <p style="margin:0 0 16px 0;color:#374151">Merci pour votre réservation. Voici vos billets électroniques. Présentez un QR par personne à l'entrée.</p>
      `;

      for (const [reservationId, tickets] of groupByReservation.entries()) {
        const first = tickets[0];
        messageHtml += `
          <div style="margin:16px 0;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#fafafa">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <div style="font-weight:700;color:#111">${first.spectacle_title}</div>
              <div style="font-size:12px;color:#10b981;background:#ecfdf5;padding:2px 8px;border-radius:999px">${first.nb_places} place${first.nb_places>1?'s':''}</div>
            </div>
            <div style="font-size:13px;color:#374151;margin-bottom:12px">
              <div>Date: ${first.date_spectacle}</div>
              <div>Heure: ${first.heure_spectacle}</div>
              <div>Lieu: ${first.lieu}</div>
              <div>Détenteur: ${prenom} ${nom} (${toEmail||''})</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px">
        `;
        for (const t of tickets) {
          messageHtml += `
            <div style="text-align:center;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:12px">
              <img src="cid:ticket_${t.ticket_id}" alt="QR ticket ${t.ticket_id}" style="max-width:140px;height:auto;display:block;margin:0 auto 8px auto" />
              <div style="font-size:12px;color:#6b7280">Ticket #${t.ticket_id}</div>
            </div>
          `;
        }
        messageHtml += `</div></div>`;
      }

      messageHtml += `</div>`;

      if (toEmail && attachments.length > 0) {
        await sendEmail(
          toEmail,
          'Vos billets Espace Comédie',
          messageHtml,
          attachments,
          false // pas de lien de désabonnement pour les billets
        );
      }
    } catch (mailErr) {
      console.error('Erreur envoi des tickets par email:', mailErr);
    }


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
router.post("/checkout", async (req, res) => {
  const { spectacles, email, prenom, nom, promoCode, user_id } = req.body;
  
  console.log('🔍 Données reçues pour checkout:', { spectacles, email, prenom, nom, promoCode });

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

    let total = 0;
    let lineItems = [];
    
    for (const item of spectacles) {
      const spectacleDetail = spectaclesDetails[item.id];
      if (!spectacleDetail) {
        throw new Error(`Spectacle avec id ${item.id} non trouvé.`);
      }
      total += spectacleDetail.prix * item.billets;
    }

    let finalTotal = total;
    let discountAmount = 0;
    let discountPercentage = 0;
    
    console.log('💰 Calcul initial - Total:', total, 'Code promo:', promoCode);
    
    if (promoCode) {
      const [promoCodes] = await pool.query(`
        SELECT * FROM promo_codes 
        WHERE code = ? AND is_active = TRUE
      `, [promoCode.code]);

      if (promoCodes.length > 0) {
        const promo = promoCodes[0];
        const now = new Date();

        if ((!promo.valid_from || new Date(promo.valid_from) <= now) &&
            (!promo.valid_until || new Date(promo.valid_until) >= now) &&
            (!promo.max_uses || promo.current_uses < promo.max_uses)) {
          switch (promo.type) {
            case 'percentage':
              discountAmount = (total * promo.value) / 100;
              finalTotal = total - discountAmount;
              discountPercentage = promo.value;
              break;
            case 'fixed':
              discountAmount = Math.min(promo.value, total);
              finalTotal = total - discountAmount;
              discountPercentage = (discountAmount / total) * 100;
              break;
            case 'free_ticket':
              const cheapestTicket = Math.min(...spectacles.map(s => spectaclesDetails[s.id].prix));
              discountAmount = Math.min(cheapestTicket, total);
              finalTotal = total - discountAmount;
              discountPercentage = (discountAmount / total) * 100;
              break;
          }
          console.log('✅ Code promo appliqué - Réduction:', discountAmount, 'Total final:', finalTotal, 'Pourcentage réduction:', discountPercentage);
        }
      }
    }
    
    for (const item of spectacles) {
      const spectacleDetail = spectaclesDetails[item.id];
      let adjustedPrice = spectacleDetail.prix;
      if (discountAmount > 0) {
        const itemTotal = spectacleDetail.prix * item.billets;
        const itemDiscount = (itemTotal * discountPercentage) / 100;
        adjustedPrice = (itemTotal - itemDiscount) / item.billets;
      }
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: spectacleDetail.title,
            description: `${item.billets} billet(s)${discountAmount > 0 ? ` - Réduction ${promoCode.code} appliquée` : ''}`,
          },
          unit_amount: Math.round(adjustedPrice * 100),
        },
        quantity: item.billets,
      });
    }

    let frontendUrl;
    if (process.env.NODE_ENV === 'production') {
      frontendUrl = 'https://espacecomedie.fr';
    } else {
      frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${frontendUrl}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${frontendUrl}/?payment=cancel`,
      metadata: {
        user_id: user_id ? String(user_id) : '0',
        prenom: prenom || '',
        nom: nom || '',
        email: email || '',
        cart: JSON.stringify(spectacles),
        total: String(finalTotal),
        original_total: String(total),
        discount_amount: String(discountAmount),
        promo_code: promoCode ? promoCode.code : null
      },
      customer_email: email,
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error("Erreur lors de la création de la session Stripe:", error);
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
    
    // 3. Enregistrer chaque réservation et générer 1 ticket (QR) par place
    for (const item of spectacles) {
      const [result] = await conn.query(
        "INSERT INTO reservation (user_id, spectacle_id, nb_places) VALUES (?, ?, ?)",
        [user_id, item.id, item.billets]
      );
      const reservationId = result.insertId;
      reservationIds.push(reservationId);
      const spectacleTitle = spectacleDetails[item.id].title;

      // S'assurer que la table ticket existe
      await conn.query(`CREATE TABLE IF NOT EXISTS ticket (
        id INT PRIMARY KEY AUTO_INCREMENT,
        reservation_id INT NOT NULL,
        qr_code_path VARCHAR(255) NULL,
        used BOOLEAN DEFAULT FALSE,
        used_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_reservation_id (reservation_id),
        FOREIGN KEY (reservation_id) REFERENCES reservation(id)
      )`);

      for (let i = 0; i < item.billets; i++) {
        const [ticketRes] = await conn.query(
          "INSERT INTO ticket (reservation_id) VALUES (?)",
          [reservationId]
        );
        const ticketId = ticketRes.insertId;
        const qrFileName = await generateTicketQRCode(ticketId, reservationId, item.id, spectacleTitle);
        await conn.query(
          "UPDATE ticket SET qr_code_path = ? WHERE id = ?",
          [qrFileName, ticketId]
        );
      }
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

// Récupérer la liste des tickets d'une réservation
router.get("/:reservationId/tickets", async (req, res) => {
  const { reservationId } = req.params;
  try {
    const [tickets] = await pool.query(
      "SELECT id as ticket_id, qr_code_path, used, used_at FROM ticket WHERE reservation_id = ? ORDER BY id ASC",
      [reservationId]
    );
    res.json({ success: true, tickets });
  } catch (error) {
    console.error("Erreur lors de la récupération des tickets:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des tickets" });
  }
});

// Récupérer le QR code d'un ticket
router.get("/ticket/:ticketId/qrcode", async (req, res) => {
  const { ticketId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT t.qr_code_path FROM ticket t JOIN reservation r ON t.reservation_id = r.id WHERE t.id = ?`,
      [ticketId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Ticket non trouvé" });
    }
    const row = rows[0];
    if (!row.qr_code_path) {
      return res.status(404).json({ error: "QR code non disponible" });
    }
    const qrPath = path.join(__dirname, '../../qrcodes', row.qr_code_path);
    if (!fs.existsSync(qrPath)) {
      return res.status(404).json({ error: "Fichier QR code non trouvé" });
    }
    res.sendFile(qrPath);
  } catch (error) {
    console.error("Erreur lors de la récupération du QR code du ticket:", error);
    res.status(500).json({ error: "Erreur lors de la récupération du QR code du ticket" });
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
      LEFT JOIN paiement_reservation pr ON r.id = pr.reservation_id
      LEFT JOIN paiement p ON pr.paiement_id = p.id
      WHERE r.user_id = ?
      ORDER BY r.id DESC
      LIMIT 50
    `, [userId]);

    // Récupérer les tickets pour toutes les réservations
    const reservationIds = reservations.map(r => r.reservation_id);
    let ticketsByReservation = {};
    if (reservationIds.length > 0) {
      const [tickets] = await pool.query(
        `SELECT id as ticket_id, reservation_id, qr_code_path, used, used_at
         FROM ticket
         WHERE reservation_id IN (?)
         ORDER BY id ASC`,
        [reservationIds]
      );
      tickets.forEach(t => {
        if (!ticketsByReservation[t.reservation_id]) ticketsByReservation[t.reservation_id] = [];
        ticketsByReservation[t.reservation_id].push({
          ticket_id: t.ticket_id,
          qr_code_path: t.qr_code_path,
          used: t.used,
          used_at: t.used_at
        });
      });
    }

    const enriched = reservations.map(r => ({
      ...r,
      tickets: ticketsByReservation[r.reservation_id] || []
    }));

    res.json({ success: true, reservations: enriched });

  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error);
    res.status(500).json({ 
      error: "Erreur lors de la récupération des réservations",
      details: error.message 
    });
  }
});



// Availability endpoint removed

// Valider un ticket (route publique pour la validation)
router.get("/validate/:reservationId", async (req, res) => {
  const { reservationId } = req.params;
  
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
        p.date as date_paiement,
        u.nom as user_nom,
        u.prenom as user_prenom,
        u.email as user_email
      FROM reservation r
      JOIN spectacle s ON r.spectacle_id = s.id
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

// Endpoint pour valider un code promo
router.post('/validate-promo-code', async (req, res) => {
  try {
    const { code, totalAmount, cart } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code promo requis' });
    }

    // Récupérer le code promo
    const [promoCodes] = await pool.query(`
      SELECT * FROM promo_codes 
      WHERE code = ? AND is_active = TRUE
    `, [code]);

    if (promoCodes.length === 0) {
      return res.status(404).json({ error: 'Code promo invalide' });
    }

    const promoCode = promoCodes[0];
    const now = new Date();

    // Vérifier la validité temporelle
    if (promoCode.valid_from && new Date(promoCode.valid_from) > now) {
      return res.status(400).json({ error: 'Code promo pas encore valide' });
    }

    if (promoCode.valid_until && new Date(promoCode.valid_until) < now) {
      return res.status(400).json({ error: 'Code promo expiré' });
    }

    // Vérifier le nombre d'utilisations
    if (promoCode.max_uses && promoCode.current_uses >= promoCode.max_uses) {
      return res.status(400).json({ error: 'Code promo épuisé' });
    }

    // Calculer la réduction
    let discountAmount = 0;
    let finalAmount = totalAmount;

    switch (promoCode.type) {
      case 'percentage':
        discountAmount = (totalAmount * promoCode.value) / 100;
        finalAmount = totalAmount - discountAmount;
        break;
      case 'fixed':
        discountAmount = Math.min(promoCode.value, totalAmount);
        finalAmount = totalAmount - discountAmount;
        break;
      case 'free_ticket':
        // Pour les tickets gratuits, on déduit le prix du billet le moins cher
        // Le value dans la base représente le nombre de billets gratuits (généralement 1)
        if (cart && Array.isArray(cart) && cart.length > 0) {
          // Calculer le prix du billet le moins cher dans le panier
          const validPrices = cart
            .map(item => item.prix)
            .filter(prix => typeof prix === 'number' && prix > 0);
          
          if (validPrices.length > 0) {
            const cheapestTicket = Math.min(...validPrices);
            discountAmount = Math.min(cheapestTicket * promoCode.value, totalAmount);
          } else {
            discountAmount = 0;
          }
        } else {
          // Fallback si pas de panier fourni
          discountAmount = Math.min(promoCode.value * 40, totalAmount); // 40€ par billet gratuit
        }
        finalAmount = Math.max(0, totalAmount - discountAmount);
        break;
    }

    res.json({
      valid: true,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        type: promoCode.type,
        value: promoCode.value,
        description: promoCode.description
      },
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalAmount: Math.round(finalAmount * 100) / 100
    });

  } catch (error) {
    console.error('Erreur lors de la validation du code promo:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour appliquer un code promo lors du checkout
router.post('/apply-promo-code', async (req, res) => {
  try {
    const { code, totalAmount } = req.body;
    
    // Valider le code promo
    const validationResponse = await fetch(`${req.protocol}://${req.get('host')}/api/reservations/validate-promo-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code, totalAmount })
    });

    if (!validationResponse.ok) {
      const errorData = await validationResponse.json();
      return res.status(validationResponse.status).json(errorData);
    }

    const validationData = await validationResponse.json();

    // Incrémenter le compteur d'utilisations
    await pool.query(`
      UPDATE promo_codes 
      SET current_uses = current_uses + 1 
      WHERE id = ?
    `, [validationData.promoCode.id]);

    res.json(validationData);

  } catch (error) {
    console.error('Erreur lors de l\'application du code promo:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// (Supprimé) Routes alternatives statiques de debug pour servir les QR codes

module.exports = router;
