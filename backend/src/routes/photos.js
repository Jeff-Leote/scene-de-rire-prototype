const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth, isAdmin, router: _authRouter } = require('./auth');

// Public: get all additional photos (up to 3)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, image_path, sort_order FROM photo_addictionnel ORDER BY COALESCE(sort_order, 9999), id LIMIT 3'
    );
    res.json(rows);
  } catch (err) {
    console.error('Erreur récupération toutes photos additionnels:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Public: get up to 3 additional photos for a spectacle (now returns all photos since they're not linked to specific spectacles)
router.get('/spectacle/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, image_path, sort_order FROM photo_addictionnel ORDER BY COALESCE(sort_order, 9999), id LIMIT 3'
    );
    res.json(rows);
  } catch (err) {
    console.error('Erreur récupération photos additionnels:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin: list all photos (no limit)
router.get('/admin/spectacle/:id', auth, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, image_path, sort_order, created_at FROM photo_addictionnel ORDER BY COALESCE(sort_order, 9999), id'
    );
    res.json(rows);
  } catch (err) {
    console.error('Erreur admin liste photos:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin: create photo
router.post('/admin', auth, isAdmin, async (req, res) => {
  try {
    const { image_path, sort_order } = req.body || {};
    if (!image_path) {
      return res.status(400).json({ error: 'image_path requis' });
    }
    const [result] = await db.query(
      'INSERT INTO photo_addictionnel (image_path, sort_order) VALUES (?, ?)',
      [image_path, sort_order ?? null]
    );
    res.json({ id: result.insertId, image_path, sort_order: sort_order ?? null });
  } catch (err) {
    console.error('Erreur admin création photo:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin: update photo
router.put('/admin/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { image_path, sort_order } = req.body || {};
    const [exists] = await db.query('SELECT id FROM photo_addictionnel WHERE id = ?', [id]);
    if (exists.length === 0) return res.status(404).json({ error: 'Photo non trouvée' });
    await db.query('UPDATE photo_addictionnel SET image_path = ?, sort_order = ? WHERE id = ?', [image_path, sort_order ?? null, id]);
    res.json({ id: Number(id), image_path, sort_order: sort_order ?? null });
  } catch (err) {
    console.error('Erreur admin maj photo:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin: delete photo
router.delete('/admin/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [exists] = await db.query('SELECT id FROM photo_addictionnel WHERE id = ?', [id]);
    if (exists.length === 0) return res.status(404).json({ error: 'Photo non trouvée' });
    await db.query('DELETE FROM photo_addictionnel WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur admin suppression photo:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;


