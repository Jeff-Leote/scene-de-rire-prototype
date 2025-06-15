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
  console.log('Admin - Ajout d\'un nouveau spectacle - Corps de la requête:', req.body);
  const { title, img, description, date_spectacle, heure_spectacle, prix, artiste_id } = req.body;

  console.log('Admin - Champs extraits:', {
    title: !!title,
    img: !!img,
    description: !!description,
    date_spectacle: !!date_spectacle,
    heure_spectacle: !!heure_spectacle,
    prix: !!prix,
    artiste_id: !!artiste_id
  });

  if (!title || !img || !description || !date_spectacle || !heure_spectacle || !prix || !artiste_id) {
    console.log('Admin - Données manquantes pour l\'ajout du spectacle');
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO spectacle (title, img, description, date_spectacle, heure_spectacle, prix, artiste_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, img, description, date_spectacle, heure_spectacle, prix, artiste_id]
    );
    
    const [newSpectacle] = await db.query(
      'SELECT s.*, a.name as artiste_name FROM spectacle s JOIN artiste a ON s.artiste_id = a.id WHERE s.id = ?',
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
router.post('/artistes', async (req, res) => {
  console.log('Admin - Ajout d\'un nouvel artiste:', req.body);
  const { name, photo, biographie } = req.body;

  if (!name || !photo || !biographie) {
    console.log('Admin - Données manquantes pour l\'ajout de l\'artiste');
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO artiste (name, photo, biographie) VALUES (?, ?, ?)',
      [name, photo, biographie]
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

    console.log('Admin - Artiste ajouté avec succès:', newArtist[0]);
    res.status(201).json(newArtist[0]);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'artiste:', error);
    res.status(500).json({ message: 'Erreur serveur' });
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
    // D'abord, réinitialiser tous les artistes
    await db.query('UPDATE artiste SET is_featured = false');
    
    // Ensuite, définir le nouvel artiste à l'affiche
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
    // Récupérer l'artiste mis à jour avec ses informations
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
      WHERE a.id = ?
    `, [artist_id]);

    const artiste = artistes[0];
    const response = {
      id: artiste.id,
      name: artiste.name,
      photo: artiste.photo,
      biographie: artiste.biographie,
      next_show: artiste.next_show_id ? {
        id: artiste.next_show_id,
        title: artiste.next_show_title,
        date: artiste.next_show_date,
        time: artiste.next_show_time
      } : null
    };

    console.log('Admin - Artiste à l\'affiche mis à jour:', response);
    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'artiste à l\'affiche:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router; 