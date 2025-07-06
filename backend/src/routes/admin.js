const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth, isAdmin } = require('./auth');

// Middleware pour protéger toutes les routes admin
router.use(auth, isAdmin);

// Récupérer tous les spectacles (pour l'admin)
router.get('/spectacles', async (req, res) => {
  console.log('Admin - Récupération des spectacles');
  try {
    const [spectacles] = await db.query(`
      SELECT s.*, a.name as artiste_name 
      FROM spectacle s 
      JOIN artiste a ON s.artiste_id = a.id 
      ORDER BY s.date_spectacle DESC, s.heure_spectacle DESC
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
  try {
    console.log('Admin - Ajout d\'un nouveau spectacle - Headers:', req.headers);
    console.log('Admin - Ajout d\'un nouveau spectacle - Corps de la requête:', req.body);
    console.log('Admin - Ajout d\'un nouveau spectacle - Type de corps:', typeof req.body);
    
    if (!req.body) {
      console.error('Admin - Corps de la requête manquant');
      return res.status(400).json({ error: 'Corps de la requête manquant' });
    }

    const { title, img, description, date_spectacle, heure_spectacle, prix, artiste_id, lieu } = req.body;

    console.log('Admin - Champs extraits:', {
      title: !!title,
      img: !!img,
      description: !!description,
      date_spectacle: !!date_spectacle,
      heure_spectacle: !!heure_spectacle,
      prix: !!prix,
      artiste_id: !!artiste_id,
      lieu: !!lieu
    });

    if (!title || !img || !description || !date_spectacle || !heure_spectacle || !prix || !artiste_id || !lieu) {
    console.log('Admin - Données manquantes pour l\'ajout du spectacle');
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

    console.log('Admin - Spectacle ajouté avec succès:', newSpectacle[0]);
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
  console.log('Admin - Modification du spectacle:', id, req.body);
  const { title, img, description, date_spectacle, heure_spectacle, prix, artiste_id } = req.body;

  if (!title || !img || !description || !date_spectacle || !heure_spectacle || !prix || !artiste_id) {
    console.log('Admin - Données manquantes pour la modification du spectacle');
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

// Récupérer tous les artistes (pour l'admin)
router.get('/artistes', async (req, res) => {
  console.log('Admin - Récupération des artistes');
  try {
    const [artistes] = await db.query(`
      SELECT a.*, COUNT(s.id) as upcoming_shows
      FROM artiste a
      LEFT JOIN spectacle s ON a.id = s.artiste_id 
      AND CONCAT(s.date_spectacle, ' ', s.heure_spectacle) > NOW()
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `);
    console.log('Admin - Nombre d\'artistes trouvés:', artistes.length);
    res.json(artistes);
  } catch (error) {
    console.error('Erreur lors de la récupération des artistes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer toutes les réservations (pour l'admin)
router.get('/reservations', async (req, res) => {
  console.log('Admin - Récupération des réservations');
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
    console.log('Admin - Nombre de réservations trouvées:', reservations.length);
    res.json(reservations);
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer une réservation (pour l'admin)
router.delete('/reservations/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Admin - Suppression de la réservation:', id);

  try {
    // Supprimer d'abord les liens paiement-réservation
    await db.query('DELETE FROM paiement_reservation WHERE reservation_id = ?', [id]);
    
    // Supprimer la réservation
    const [result] = await db.query('DELETE FROM reservation WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      console.log('Admin - Réservation non trouvée pour suppression:', id);
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }

    console.log('Admin - Réservation supprimée avec succès:', id);
    res.json({ message: 'Réservation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la réservation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Modifier un artiste
router.put('/artistes/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Admin - Modification de l\'artiste:', id, req.body);
  const { name, photo, biographie } = req.body;

  if (!name || !photo || !biographie) {
    console.log('Admin - Données manquantes pour la modification de l\'artiste');
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
      console.log('Admin - Artiste non trouvé:', id);
      return res.status(404).json({ error: 'Artiste non trouvé' });
    }

    console.log('Admin - Artiste modifié avec succès:', updatedArtist[0]);
    res.json(updatedArtist[0]);
  } catch (error) {
    console.error('Erreur lors de la modification de l\'artiste:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un artiste
router.delete('/artistes/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Admin - Suppression de l\'artiste:', id);

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
      console.log('Admin - Artiste non trouvé pour suppression:', id);
      return res.status(404).json({ error: 'Artiste non trouvé' });
    }

    console.log('Admin - Artiste supprimé avec succès:', id);
    res.json({ message: 'Artiste supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'artiste:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ajouter un nouvel artiste
router.post('/artiste', async (req, res) => {
  console.log('Admin - Ajout d\'un nouvel artiste - Headers:', req.headers);
  console.log('Admin - Ajout d\'un nouvel artiste - Body:', req.body);
  const { name, photo, photo_featured, biographie } = req.body;

  if (!name || !photo || !photo_featured || !biographie) {
    console.log('Admin - Données manquantes pour l\'ajout de l\'artiste:', {
      name: !!name,
      photo: !!photo,
      photo_featured: !!photo_featured,
      biographie: !!biographie
    });
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    console.log('Admin - Tentative d\'insertion dans la base de données');
    const [result] = await db.query(
      'INSERT INTO artiste (name, photo, photo_featured, biographie) VALUES (?, ?, ?, ?)',
      [name, photo, photo_featured, biographie]
    );
    console.log('Admin - Insertion réussie, ID:', result.insertId);

    const [newArtist] = await db.query(
      `SELECT a.*, COUNT(s.id) as upcoming_shows
       FROM artiste a
       LEFT JOIN spectacle s ON a.id = s.artiste_id 
       AND CONCAT(s.date_spectacle, ' ', s.heure_spectacle) > NOW()
       WHERE a.id = ?
       GROUP BY a.id`,
      [result.insertId]
    );

    console.log('Admin - Artiste ajouté avec succès:', newArtist[0]);
    res.status(201).json(newArtist[0]);
  } catch (error) {
    console.error('Erreur détaillée lors de l\'ajout de l\'artiste:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// Récupérer l'artiste à l'affiche (admin)
router.get('/featured', async (req, res) => {
  console.log('Admin - Récupération de l\'artiste à l\'affiche');
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

    console.log('Admin - Artiste à l\'affiche trouvé:', response);
    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'artiste à l\'affiche:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Définir l'artiste à l'affiche
router.post('/featured', async (req, res) => {
  const { artist_id } = req.body;
  console.log('Admin - Définition de l\'artiste à l\'affiche:', artist_id);

  if (!artist_id) {
    return res.status(400).json({ error: 'ID de l\'artiste requis' });
  }

  try {
    // Vérifier si l'artiste a des spectacles à venir
    const [upcomingShows] = await db.query(`
      SELECT COUNT(*) as count 
      FROM spectacle 
      WHERE artiste_id = ? 
      AND CONCAT(date_spectacle, ' ', heure_spectacle) > NOW()
    `, [artist_id]);

    if (upcomingShows[0].count === 0) {
      return res.status(400).json({ 
        error: 'Cet artiste n\'a pas de spectacles à venir. Impossible de le mettre en avant.' 
      });
    }

    // D'abord, réinitialiser tous les artistes
    await db.query('START TRANSACTION');
    try {
      await db.query('UPDATE artiste SET is_featured = false');
      const [result] = await db.query(
        'UPDATE artiste SET is_featured = true WHERE id = ?',
        [artist_id]
      );
      if (result.affectedRows === 0) throw new Error('NOT_FOUND');
      await db.query('COMMIT');
    } catch (e) {
      await db.query('ROLLBACK');
      if (e.message === 'NOT_FOUND') return res.status(404).json({ error: 'Artiste non trouvé' });
      throw e;
    }

    // Récupérer l'artiste mis à jour avec ses spectacles à venir
    const [artistes] = await db.query(`
      SELECT a.*, 
        (SELECT COUNT(*) FROM spectacle s 
         WHERE s.artiste_id = a.id 
         AND CONCAT(s.date_spectacle, ' ', s.heure_spectacle) > NOW()) as upcoming_shows
      FROM artiste a 
      WHERE a.id = ?
    `, [artist_id]);

    res.json(artistes[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'artiste à l\'affiche:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router; 