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
      success_url: `${process.env.FRONTEND_URL}/reservation/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/reservation`,
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

module.exports = router; 