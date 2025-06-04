const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth, isAdmin } = require('./auth');

// Middleware pour protéger toutes les routes admin
router.use(auth);
router.use(isAdmin);

// Récupérer tous les spectacles (pour l'admin)
router.get('/spectacles', async (req, res) => {
  console.log('Admin - Récupération des spectacles');
  try {
    const [spectacles] = await db.query(`
      SELECT s.*, a.name as artist_name 
      FROM spectacle s 
      JOIN artiste a ON s.artiste_id = a.id 
      ORDER BY s.date DESC
    `);
    console.log('Admin - Nombre de spectacles trouvés:', spectacles.length);
    res.json(spectacles);
  } catch (error) {
    console.error('Erreur lors de la récupération des spectacles:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ajouter un nouveau spectacle
router.post('/spectacles', async (req, res) => {
  console.log('Admin - Ajout d\'un nouveau spectacle:', req.body);
  const { title, img, description, date, prix, artiste_id } = req.body;

  if (!title || !img || !description || !date || !prix || !artiste_id) {
    console.log('Admin - Données manquantes pour l\'ajout du spectacle');
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO spectacle (title, img, description, date, prix, artiste_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title, img, description, date, prix, artiste_id]
    );
    
    const [newSpectacle] = await db.query(
      'SELECT s.*, a.name as artist_name FROM spectacle s JOIN artiste a ON s.artiste_id = a.id WHERE s.id = ?',
      [result.insertId]
    );

    console.log('Admin - Spectacle ajouté avec succès:', newSpectacle[0]);
    res.status(201).json(newSpectacle[0]);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du spectacle:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Modifier un spectacle
router.put('/spectacles/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Admin - Modification du spectacle:', id, req.body);
  const { title, img, description, date, prix, artiste_id } = req.body;

  if (!title || !img || !description || !date || !prix || !artiste_id) {
    console.log('Admin - Données manquantes pour la modification du spectacle');
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    await db.query(
      'UPDATE spectacle SET title = ?, img = ?, description = ?, date = ?, prix = ?, artiste_id = ? WHERE id = ?',
      [title, img, description, date, prix, artiste_id, id]
    );

    const [updatedSpectacle] = await db.query(
      'SELECT s.*, a.name as artist_name FROM spectacle s JOIN artiste a ON s.artiste_id = a.id WHERE s.id = ?',
      [id]
    );

    if (updatedSpectacle.length === 0) {
      console.log('Admin - Spectacle non trouvé:', id);
      return res.status(404).json({ error: 'Spectacle non trouvé' });
    }

    console.log('Admin - Spectacle modifié avec succès:', updatedSpectacle[0]);
    res.json(updatedSpectacle[0]);
  } catch (error) {
    console.error('Erreur lors de la modification du spectacle:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un spectacle
router.delete('/spectacles/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Admin - Suppression du spectacle:', id);

  try {
    const [result] = await db.query('DELETE FROM spectacle WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      console.log('Admin - Spectacle non trouvé pour suppression:', id);
      return res.status(404).json({ error: 'Spectacle non trouvé' });
    }

    console.log('Admin - Spectacle supprimé avec succès:', id);
    res.json({ message: 'Spectacle supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du spectacle:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router; 