const express = require('express');
const router = express.Router();
const pool = require('../db');

// Add validation middleware
const validateId = (req, res, next) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: 'ID invalide' });
  }
  req.params.id = id;
  next();
};

// GET /api/lieu/images/main - retourne l'image principale
router.get('/images/main', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, image_path, is_main FROM lieu WHERE is_main = TRUE LIMIT 1');
    res.json(rows[0] || null);
  } catch (err) {
    console.error("Erreur lors de la récupération de l'image principale du lieu :", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération de l'image principale du lieu" });
  }
});

// GET /api/lieu/images/gallery - retourne les images de galerie
router.get('/images/gallery', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, image_path, is_main FROM lieu WHERE is_main = FALSE');
    res.json(rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des images de galerie du lieu :', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des images de galerie du lieu' });
  }
});

// GET /api/lieu/images - retourne toutes les images
router.get('/images', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, image_path, is_main FROM lieu');
    res.json(rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des images du lieu :', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des images du lieu' });
  }
});

// POST /api/lieu/images - ajouter une image
router.post('/images', async (req, res) => {
  const { image_path, is_main } = req.body;
  if (!image_path) {
    return res.status(400).json({ error: 'image_path est requis' });
  }
  try {
    const [result] = await pool.query('INSERT INTO lieu (image_path, is_main) VALUES (?, ?)', [image_path, !!is_main]);
    res.status(201).json({ id: result.insertId, image_path, is_main: !!is_main });
  } catch (err) {
    console.error("Erreur lors de l'ajout de l'image du lieu :", err);
    res.status(500).json({ error: "Erreur serveur lors de l'ajout de l'image du lieu" });
  }
});

// PUT /api/lieu/images/:id - modifier une image
router.put('/images/:id', async (req, res) => {
  const { id } = req.params;
  const { image_path, is_main } = req.body;
  if (!image_path) {
    return res.status(400).json({ error: 'image_path est requis' });
  }
  try {
    const [existing] = await pool.query('SELECT id FROM lieu WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Image non trouvée' });
    }
    await pool.query('UPDATE lieu SET image_path = ?, is_main = ? WHERE id = ?', [image_path, !!is_main, id]);
    res.json({ id, image_path, is_main: !!is_main });
  } catch (err) {
    console.error("Erreur lors de la modification de l'image du lieu :", err);
    res.status(500).json({ error: "Erreur serveur lors de la modification de l'image du lieu" });
  }
});

// DELETE /api/lieu/images/:id - supprimer une image
router.delete('/images/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM lieu WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Erreur lors de la suppression de l'image du lieu :", err);
    res.status(500).json({ error: "Erreur serveur lors de la suppression de l'image du lieu" });
  }
});

module.exports = router;
