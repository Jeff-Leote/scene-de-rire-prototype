const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth, isAdmin, router: _authRouter } = require('./auth');

// Public: get all additional photos (up to 3)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, image_path FROM photo_addictionnel ORDER BY id LIMIT 3'
    );
    res.json(rows);
  } catch (err) {
    console.error('Erreur récupération toutes photos additionnels:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Public: get up to 3 additional photos for a specific spectacle (fallback to global if column missing)
router.get('/spectacle/:id', async (req, res) => {
  try {
    const spectacleId = Number(req.params.id);
    if (!Number.isFinite(spectacleId)) {
      return res.status(400).json({ error: 'spectacle_id invalide' });
    }
    // Chercher uniquement par catégorie liée au spectacle
    const [[spec]] = await db.query('SELECT category_id FROM spectacle WHERE id = ?', [spectacleId]);
    const categoryId = spec?.category_id || null;
    if (!categoryId) return res.json([]);
    const [catRows] = await db.query(
      'SELECT id, image_path FROM photo_addictionnel WHERE category_id = ? ORDER BY id LIMIT 3',
      [categoryId]
    );
    return res.json(catRows);
  } catch (err) {
    console.error('Erreur récupération photos additionnels:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin: list all photos (no limit)
router.get('/admin/spectacle/:id', auth, isAdmin, async (req, res) => {
  try {
    const spectacleId = Number(req.params.id);
    if (!Number.isFinite(spectacleId)) {
      return res.status(400).json({ error: 'spectacle_id invalide' });
    }
    const [[spec]] = await db.query('SELECT category_id FROM spectacle WHERE id = ?', [spectacleId]);
    const categoryId = spec?.category_id || null;
    if (!categoryId) return res.json([]);
    const [rows] = await db.query(
      'SELECT id, image_path, created_at FROM photo_addictionnel WHERE category_id = ? ORDER BY id',
      [categoryId]
    );
    return res.json(rows);
  } catch (err) {
    console.error('Erreur admin liste photos:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin: create photo
router.post('/admin', auth, isAdmin, async (req, res) => {
  try {
    const { image_path, category_id } = req.body || {};
    if (!image_path) {
      return res.status(400).json({ error: 'image_path requis' });
    }
    const [result] = await db.query(
      'INSERT INTO photo_addictionnel (image_path, category_id) VALUES (?, ?)',
      [image_path, category_id ?? null]
    );
    return res.json({ id: result.insertId, image_path, category_id: category_id ?? null });
  } catch (err) {
    console.error('Erreur admin création photo:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin: update photo
router.put('/admin/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { image_path, category_id } = req.body || {};
    const [exists] = await db.query('SELECT id FROM photo_addictionnel WHERE id = ?', [id]);
    if (exists.length === 0) return res.status(404).json({ error: 'Photo non trouvée' });
    await db.query('UPDATE photo_addictionnel SET image_path = ?, category_id = ? WHERE id = ?', [image_path, category_id ?? null, id]);
    return res.json({ id: Number(id), image_path, category_id: category_id ?? null });
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


