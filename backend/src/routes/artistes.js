const express = require('express');
const router = express.Router();
const db = require('../db');

// Récupérer tous les artistes
router.get('/', async (req, res) => {
  try {
    const [artistes] = await db.query(`
      SELECT a.*, 0 as upcoming_shows
      FROM artiste a
      ORDER BY a.created_at DESC
    `);
    res.json(artistes);
  } catch (error) {
    console.error('Erreur lors de la récupération des artistes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer l'artiste à l'affiche (automatique)
router.get('/featured', async (req, res) => {
  try {
    // Sélectionner le prochain spectacle à venir
    const [rows] = await db.query(`
      SELECT s.id as next_show_id, s.title as next_show_title, s.date_spectacle as next_show_date, s.heure_spectacle as next_show_time, s.img as next_show_image
      FROM spectacle s
      WHERE s.date_spectacle >= CURDATE()
      ORDER BY s.date_spectacle ASC, s.heure_spectacle ASC
      LIMIT 1
    `);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Aucun spectacle à venir" });
    }
    const spectacle = rows[0];
    const response = {
      id: 1,
      name: "Artiste à l'affiche",
      photo: "default-artist.jpg",
      next_show: {
        id: spectacle.next_show_id,
        title: spectacle.next_show_title,
        date: spectacle.next_show_date,
        time: spectacle.next_show_time,
        image: spectacle.next_show_image
      }
    };
    res.json(response);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'artiste à l'affiche:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router; 