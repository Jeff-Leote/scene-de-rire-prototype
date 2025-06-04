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
      WHERE s.date > NOW()
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `);
    res.json(artistes);
  } catch (error) {
    console.error('Erreur lors de la récupération des artistes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router; 