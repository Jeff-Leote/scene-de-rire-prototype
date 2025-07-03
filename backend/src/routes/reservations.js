const express = require("express");
const router = express.Router();
const pool = require("../db");
require("dotenv").config({ path: '../.env' });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/checkout", async (req, res) => {
  const { spectacles, email, prenom, nom } = req.body;

  if (!spectacles || !Array.isArray(spectacles) || spectacles.length === 0) {
    return res.status(400).json({ error: "Le panier est vide ou invalide." });
  }

  try {
    const spectacleIds = spectacles.map(s => s.id);
    const [rows] = await pool.query(
      `SELECT id, title, prix FROM spectacle WHERE id IN (?)`,
      [spectacleIds]
    );

    const spectaclesDetails = {};
    rows.forEach(row => {
      spectaclesDetails[row.id] = { title: row.title, prix: row.prix };
    });

    const line_items = spectacles.map(item => {
      const spectacleDetail = spectaclesDetails[item.id];
      if (!spectacleDetail) {
        throw new Error(`Spectacle avec id ${item.id} non trouvé.`);
      }
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: spectacleDetail.title,
          },
          unit_amount: spectacleDetail.prix * 100, // Stripe attend des centimes
        },
        quantity: item.billets,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/mon-compte?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/mon-compte?payment=cancel`,
      customer_email: email,
      metadata: {
        prenom,
        nom,
        // Stocker les détails du panier pour les retrouver après le paiement
        cart: JSON.stringify(spectacles),
      }
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
    for (const item of spectacles) {
      const [result] = await conn.query(
        "INSERT INTO reservation (user_id, spectacle_id, nb_places) VALUES (?, ?, ?)",
        [user_id, item.id, item.billets]
      );
      reservationIds.push(result.insertId);
    }

    // Calculate individual amounts for each spectacle
    const totalSpectacles = spectacles.reduce((sum, item) => sum + item.billets, 0);
    const amountPerTicket = montant / totalSpectacles;
    
    for (let i = 0; i < reservationIds.length; i++) {
      const reservation_id = reservationIds[i];
      const spectacleAmount = Math.round(amountPerTicket * spectacles[i].billets);
      await conn.query(
        "INSERT INTO paiement (reservation_id, montant, statut) VALUES (?, ?, ?)",
        [reservation_id, spectacleAmount, true]
      );
    }

    await conn.commit();
    res.status(201).json({ success: true, reservationIds });
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

module.exports = router; 