const express = require('express');
const router = express.Router();
const db = require('../db');

// Récupérer l'état de maintenance (public)
router.get('/maintenance', async (req, res) => {
  try {
    await db.query(
      'CREATE TABLE IF NOT EXISTS settings (\n      `key` VARCHAR(100) PRIMARY KEY,\n      `value` TEXT,\n      `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n    )'
    );
    const [rows] = await db.query('SELECT `value` FROM settings WHERE `key` = ? LIMIT 1', ['maintenance_enabled']);
    const enabled = rows[0]?.value === '1';
    res.json({ maintenance_enabled: enabled });
  } catch (error) {
    console.error('Erreur lecture maintenance:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
