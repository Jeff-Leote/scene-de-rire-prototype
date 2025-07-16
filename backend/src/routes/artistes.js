const express = require('express');
const router = express.Router();
const db = require('../db');

// Récupérer tous les artistes
router.get('/', async (req, res) => {
  try {
    const [artistes] = await db.query(`
      SELECT a.*, COUNT(s.id) as upcoming_shows
      FROM artiste a
      LEFT JOIN spectacle s ON a.id = s.artiste_id
      WHERE CONCAT(s.date_spectacle, ' ', s.heure_spectacle) > NOW()
      GROUP BY a.id
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
    // Sélectionner le prochain spectacle à venir et son artiste
    const [rows] = await db.query(`
      SELECT a.*, s.id as next_show_id, s.title as next_show_title, s.date_spectacle as next_show_date, s.heure_spectacle as next_show_time
      FROM spectacle s
      JOIN artiste a ON s.artiste_id = a.id
      WHERE TIMESTAMP(s.date_spectacle, s.heure_spectacle) >= CONVERT_TZ(NOW(), 'UTC', 'Europe/Paris')
      ORDER BY s.date_spectacle ASC, s.heure_spectacle ASC
      LIMIT 1
    `);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Aucun spectacle à venir, donc aucun artiste à l'affiche" });
    }
    const artiste = rows[0];
    const response = {
      id: artiste.id,
      name: artiste.name,
      photo: artiste.photo,
      photo_featured: artiste.photo_featured,
      biographie: artiste.biographie,
      next_show: {
        id: artiste.next_show_id,
        title: artiste.next_show_title,
        date: artiste.next_show_date,
        time: artiste.next_show_time
      }
    };
    res.json(response);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'artiste à l'affiche:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router; 