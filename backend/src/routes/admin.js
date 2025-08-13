const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth, isAdmin } = require('./auth');

// Middleware pour protéger toutes les routes admin
router.use(auth, isAdmin);

// Récupérer tous les spectacles (pour l'admin)
router.get('/spectacles', async (req, res) => {

  try {
    const [spectacles] = await db.query(`
      SELECT s.*, a.name as artiste_name 
      FROM spectacle s 
      JOIN artiste a ON s.artiste_id = a.id 
      ORDER BY s.date_spectacle DESC, s.heure_spectacle DESC
    `);

    res.json(spectacles);
  } catch (error) {
    console.error('Erreur lors de la récupération des spectacles:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ajouter un nouveau spectacle
router.post('/spectacles', async (req, res) => {
  try {

    
    if (!req.body) {
      console.error('Admin - Corps de la requête manquant');
      return res.status(400).json({ error: 'Corps de la requête manquant' });
    }

    const { title, img, description, date_spectacle, heure_spectacle, prix, artiste_id, lieu } = req.body;



    if (!title || !img || !description || !date_spectacle || !heure_spectacle || !prix || !artiste_id || !lieu) {

    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    const [result] = await db.query(
        'INSERT INTO spectacle (title, img, description, date_spectacle, heure_spectacle, prix, artiste_id, lieu) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [title, img, description, date_spectacle, heure_spectacle, prix, artiste_id, lieu]
    );
    
    const [newSpectacle] = await db.query(
      'SELECT s.*, a.name as artiste_name FROM spectacle s JOIN artiste a ON s.artiste_id = a.id WHERE s.id = ?',
      [result.insertId]
    );


    res.status(201).json(newSpectacle[0]);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du spectacle:', error);
      res.status(500).json({ 
        message: 'Erreur serveur',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  } catch (error) {
    console.error('Erreur générale:', error);
    res.status(500).json({ 
      message: 'Erreur serveur',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Modifier un spectacle
router.put('/spectacles/:id', async (req, res) => {
  const { id } = req.params;

  const { title, img, description, date_spectacle, heure_spectacle, prix, artiste_id } = req.body;

  if (!title || !img || !description || !date_spectacle || !heure_spectacle || !prix || !artiste_id) {

    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    await db.query(
      'UPDATE spectacle SET title = ?, img = ?, description = ?, date_spectacle = ?, heure_spectacle = ?, prix = ?, artiste_id = ? WHERE id = ?',
      [title, img, description, date_spectacle, heure_spectacle, prix, artiste_id, id]
    );

    const [updatedSpectacle] = await db.query(
      'SELECT s.*, a.name as artiste_name FROM spectacle s JOIN artiste a ON s.artiste_id = a.id WHERE s.id = ?',
      [id]
    );

    if (updatedSpectacle.length === 0) {

      return res.status(404).json({ error: 'Spectacle non trouvé' });
    }


    res.json(updatedSpectacle[0]);
  } catch (error) {
    console.error('Erreur lors de la modification du spectacle:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un spectacle
router.delete('/spectacles/:id', async (req, res) => {
  const { id } = req.params;


  try {
    const [result] = await db.query('DELETE FROM spectacle WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {

      return res.status(404).json({ error: 'Spectacle non trouvé' });
    }


    res.json({ message: 'Spectacle supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du spectacle:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer tous les artistes (pour l'admin)
router.get('/artistes', async (req, res) => {
  try {
    const [artistes] = await db.query(`
      SELECT a.*, COUNT(s.id) as upcoming_shows
      FROM artiste a
      LEFT JOIN spectacle s ON a.id = s.artiste_id 
      AND CONCAT(s.date_spectacle, ' ', s.heure_spectacle) > NOW()
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `);
    res.json(artistes);
  } catch (error) {
    console.error('Erreur lors de la récupération des artistes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer toutes les réservations (pour l'admin)
router.get('/reservations', async (req, res) => {
  try {
    const [reservations] = await db.query(`
      SELECT 
        r.id as reservation_id,
        r.nb_places,
        r.date as reservation_date,
        s.id as spectacle_id,
        s.title as spectacle_title,
        s.date_spectacle,
        s.heure_spectacle,
        s.prix,
        s.lieu,
        a.name as artiste_name,
        u.id as user_id,
        u.civility,
        u.prenom as user_firstname,
        u.nom as user_lastname,
        u.email as user_email,
        p.montant as montant_paye,
        p.statut as paiement_statut,
        p.date as date_paiement
      FROM reservation r
      JOIN spectacle s ON r.spectacle_id = s.id
      JOIN artiste a ON s.artiste_id = a.id
      JOIN user u ON r.user_id = u.id
      LEFT JOIN paiement_reservation pr ON r.id = pr.reservation_id
      LEFT JOIN paiement p ON pr.paiement_id = p.id
      ORDER BY r.date DESC
    `);
    res.json(reservations);
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer une réservation (pour l'admin)
router.delete('/reservations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Supprimer d'abord les liens paiement-réservation
    await db.query('DELETE FROM paiement_reservation WHERE reservation_id = ?', [id]);
    
    // Supprimer la réservation
    const [result] = await db.query('DELETE FROM reservation WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }
    res.json({ message: 'Réservation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la réservation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Modifier un artiste
router.put('/artistes/:id', async (req, res) => {
  const { id } = req.params;
  const { name, photo, biographie } = req.body;

  if (!name || !photo || !biographie) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    await db.query(
      'UPDATE artiste SET name = ?, photo = ?, biographie = ? WHERE id = ?',
      [name, photo, biographie, id]
    );

    const [updatedArtist] = await db.query(
      `SELECT a.*, COUNT(s.id) as upcoming_shows
       FROM artiste a
       LEFT JOIN spectacle s ON a.id = s.artiste_id 
       AND CONCAT(s.date_spectacle, ' ', s.heure_spectacle) > NOW()
       WHERE a.id = ?
       GROUP BY a.id`,
      [id]
    );

    if (updatedArtist.length === 0) {
      return res.status(404).json({ error: 'Artiste non trouvé' });
    }
    res.json(updatedArtist[0]);
  } catch (error) {
    console.error('Erreur lors de la modification de l\'artiste:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un artiste
router.delete('/artistes/:id', async (req, res) => {
  const { id } = req.params;


  try {
    // Vérifier si l'artiste a des spectacles associés
    const [spectacles] = await db.query('SELECT id FROM spectacle WHERE artiste_id = ?', [id]);
    if (spectacles.length > 0) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer cet artiste car il a des spectacles associés' 
      });
    }

    const [result] = await db.query('DELETE FROM artiste WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Artiste non trouvé' });
    }
    res.json({ message: 'Artiste supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'artiste:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ajouter un nouvel artiste
router.post('/artiste', async (req, res) => {
  const { name, photo, photo_featured, biographie } = req.body;

  if (!name || !photo || !photo_featured || !biographie) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO artiste (name, photo, photo_featured, biographie) VALUES (?, ?, ?, ?)',
      [name, photo, photo_featured, biographie]
    );

    const [newArtist] = await db.query(
      `SELECT a.*, COUNT(s.id) as upcoming_shows
       FROM artiste a
       LEFT JOIN spectacle s ON a.id = s.artiste_id 
       AND CONCAT(s.date_spectacle, ' ', s.heure_spectacle) > NOW()
       WHERE a.id = ?
       GROUP BY a.id`,
      [result.insertId]
    );


    res.status(201).json(newArtist[0]);
  } catch (error) {
    console.error('Erreur détaillée lors de l\'ajout de l\'artiste:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
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