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

// Récupérer l'artiste à l'affiche
router.get('/featured', async (req, res) => {
  console.log('Récupération de l\'artiste à l\'affiche');
  try {
    const [artistes] = await db.query(`
      SELECT a.*, 
        (SELECT s.id FROM spectacle s 
         WHERE s.artiste_id = a.id 
         AND CONCAT(s.date_spectacle, ' ', s.heure_spectacle) > NOW()
         ORDER BY s.date_spectacle, s.heure_spectacle
         LIMIT 1) as next_show_id,
        (SELECT s.title FROM spectacle s 
         WHERE s.artiste_id = a.id 
         AND CONCAT(s.date_spectacle, ' ', s.heure_spectacle) > NOW()
         ORDER BY s.date_spectacle, s.heure_spectacle
         LIMIT 1) as next_show_title,
        (SELECT s.date_spectacle FROM spectacle s 
         WHERE s.artiste_id = a.id 
         AND CONCAT(s.date_spectacle, ' ', s.heure_spectacle) > NOW()
         ORDER BY s.date_spectacle, s.heure_spectacle
         LIMIT 1) as next_show_date,
        (SELECT s.heure_spectacle FROM spectacle s 
         WHERE s.artiste_id = a.id 
         AND CONCAT(s.date_spectacle, ' ', s.heure_spectacle) > NOW()
         ORDER BY s.date_spectacle, s.heure_spectacle
         LIMIT 1) as next_show_time
      FROM artiste a 
      WHERE a.is_featured = true
      LIMIT 1
    `);

    if (artistes.length === 0) {
      return res.status(404).json({ error: 'Aucun artiste à l\'affiche' });
    }

    const artiste = artistes[0];
    const response = {
      id: artiste.id,
      name: artiste.name,
      photo: artiste.photo,
      photo_featured: artiste.photo_featured,
      biographie: artiste.biographie,
      next_show: artiste.next_show_id ? {
        id: artiste.next_show_id,
        title: artiste.next_show_title,
        date: artiste.next_show_date,
        time: artiste.next_show_time
      } : null
    };

    console.log('Artiste à l\'affiche trouvé:', response);
    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'artiste à l\'affiche:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router; 