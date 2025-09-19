const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth, isAdmin } = require('./auth');
const { sendBulkEmails } = require('../services/emailService');
const path = require('path');
const fs = require('fs');
let multer, sharp, { createClient } = require('@supabase/supabase-js'); // lazy require to avoid crash if not installed in some envs

// Middleware pour protéger toutes les routes admin
router.use(auth, isAdmin);
// ====== Upload d'image spectacle (WEBP) ======
// Sauvegarde dans frontend/public/assets/img/spectacles et renvoie le chemin relatif
try {
  multer = require('multer');
  sharp = require('sharp');
  const { createClient } = require('@supabase/supabase-js');
} catch (_) {
  // Les dépendances seront nécessaires en production: npm i multer sharp @supabase/supabase-js
}

if (multer && sharp) {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
    fileFilter: (req, file, cb) => {
      const ok = /^image\/(png|jpeg|jpg|webp)$/i.test(file.mimetype);
      if (!ok) return cb(new Error('Type de fichier non autorisé'));
      cb(null, true);
    }
  });

  router.post('/upload/spectacle-image', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'Aucun fichier fourni' });
      
      console.log('📁 Upload spectacle → mimetype =', req.file.mimetype, '| size =', req.file.size);
      
      // Configuration Supabase si en production
      const isProduction = process.env.NODE_ENV === 'production';
      
      if (isProduction && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        // === PRODUCTION: Upload vers Supabase Storage ===
        console.log('☁️ Upload vers Supabase Storage en production');
        console.log('🔧 SUPABASE_URL:', process.env.SUPABASE_URL);
        console.log('🔧 SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
        
        // Initialiser le client Supabase
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Construire un nom basé sur le nom original, sécurisé
        const original = (req.file.originalname || 'image').toString();
        const parsed = path.parse(original);
        const baseRaw = (parsed.name || 'image').toLowerCase();
        const baseSanitized = baseRaw
          .normalize('NFKD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s._-]/g, '')
          .replace(/[\s]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^[-_.]+|[-_.]+$/g, '') || 'image';

        // Convertir en WEBP avec Sharp
        const webpBuffer = await sharp(req.file.buffer).webp({ quality: 85 }).toBuffer();
        
        // Nom du fichier simple (Supabase gère les collisions automatiquement)
        const fileName = `${baseSanitized}.webp`;
        
        // Upload vers Supabase Storage
        console.log('📤 Upload vers Supabase - fileName:', fileName, '| buffer size:', webpBuffer.length);
        const { data, error } = await supabase.storage
          .from('spectacle')
          .upload(fileName, webpBuffer, {
            contentType: 'image/webp',
            upsert: false
          });

        if (error) {
          console.error('❌ Erreur Supabase Storage:', error);
          console.error('❌ Détails erreur:', JSON.stringify(error, null, 2));
          return res.status(500).json({ error: 'Erreur Supabase lors de l\'upload: ' + error.message });
        }

        // Récupérer l'URL publique
        const { data: urlData } = supabase.storage
          .from('spectacle')
          .getPublicUrl(fileName);

        console.log('✅ Upload Supabase réussi:', urlData.publicUrl);
        return res.json({ path: urlData.publicUrl });

      } else {
        // === DÉVELOPPEMENT: Upload local ===
        console.log('💻 Upload local en développement');
        
        // Dossier monté par Docker: ./frontend/public/assets/img/spectacles -> /app/frontend_public_assets/spectacles
        const mountBase = process.env.FRONTEND_PUBLIC_MOUNT_DIR || '/app/frontend_public_assets';
        const frontendDir = path.join(mountBase, 'spectacles');
        console.log('📁 Upload spectacle (DEV) → frontendDir =', frontendDir);
        await fs.promises.mkdir(frontendDir, { recursive: true });

        // Construire un nom basé sur le nom original, sécurisé et unique
        const original = (req.file.originalname || 'image').toString();
        const parsed = path.parse(original);
        const baseRaw = (parsed.name || 'image').toLowerCase();
        const baseSanitized = baseRaw
          .normalize('NFKD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s._-]/g, '')
          .replace(/[\s]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^[-_.]+|[-_.]+$/g, '') || 'image';

        let targetName = `${baseSanitized}.webp`;
        let targetAbs = path.join(frontendDir, targetName);
        let suffix = 1;
        while (fs.existsSync(targetAbs)) {
          targetName = `${baseSanitized}-${suffix}.webp`;
          targetAbs = path.join(frontendDir, targetName);
          suffix += 1;
        }
        const relativePath = `/assets/img/spectacles/${targetName}`;

        // Convertir en WEBP pour uniformiser
        await sharp(req.file.buffer).webp({ quality: 85 }).toFile(targetAbs);
        console.log('✅ Upload spectacle écrit:', targetAbs);

        return res.json({ path: relativePath });
      }
    } catch (error) {
      console.error('Erreur upload image:', error);
      return res.status(500).json({ error: 'Erreur serveur lors de l\'upload' });
    }
  });
}

// ====== Upload d'image artiste (WEBP) ======
// Sauvegarde dans frontend/public/assets/img/photo_artiste et renvoie le chemin relatif
if (multer && sharp) {
  const uploadArtiste = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
    fileFilter: (req, file, cb) => {
      const ok = /^image\/(png|jpeg|jpg|webp)$/i.test(file.mimetype);
      if (!ok) return cb(new Error('Type de fichier non autorisé'));
      cb(null, true);
    }
  });

  router.post('/upload/artiste-image', uploadArtiste.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'Aucun fichier fourni' });
      
      console.log('📁 Upload artiste → mimetype =', req.file.mimetype, '| size =', req.file.size);
      
      // Configuration Supabase si en production
      const isProduction = process.env.NODE_ENV === 'production';
      
      if (isProduction && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        // === PRODUCTION: Upload vers Supabase Storage ===
        console.log('☁️ Upload artiste vers Supabase Storage en production');
        console.log('🔧 SUPABASE_URL:', process.env.SUPABASE_URL);
        console.log('🔧 SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
        
        // Initialiser le client Supabase
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Construire un nom basé sur le nom original, sécurisé
        const original = (req.file.originalname || 'image').toString();
        const parsed = path.parse(original);
        const baseRaw = (parsed.name || 'image').toLowerCase();
        const baseSanitized = baseRaw
          .normalize('NFKD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s._-]/g, '')
          .replace(/[\s]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^[-_.]+|[-_.]+$/g, '') || 'image';

        // Convertir en WEBP avec Sharp
        const webpBuffer = await sharp(req.file.buffer).webp({ quality: 85 }).toBuffer();
        
        // Nom du fichier simple (Supabase gère les collisions automatiquement)
        const fileName = `${baseSanitized}.webp`;
        
        // Upload vers Supabase Storage
        console.log('📤 Upload artiste vers Supabase - fileName:', fileName, '| buffer size:', webpBuffer.length);
        const { data, error } = await supabase.storage
          .from('artiste')
          .upload(fileName, webpBuffer, {
            contentType: 'image/webp',
            upsert: false
          });

        if (error) {
          console.error('❌ Erreur Supabase Storage artiste:', error);
          console.error('❌ Détails erreur:', JSON.stringify(error, null, 2));
          return res.status(500).json({ error: 'Erreur Supabase lors de l\'upload: ' + error.message });
        }

        // Récupérer l'URL publique
        const { data: urlData } = supabase.storage
          .from('artiste')
          .getPublicUrl(fileName);

        console.log('✅ Upload artiste Supabase réussi:', urlData.publicUrl);
        return res.json({ path: urlData.publicUrl });

      } else {
        // === DÉVELOPPEMENT: Upload local ===
        console.log('💻 Upload artiste local en développement');
        
        // Dossier monté par Docker: ./frontend/public/assets/img/photo_artiste -> /app/frontend_public_assets/photo_artiste
        const mountBase = process.env.FRONTEND_PUBLIC_MOUNT_DIR || '/app/frontend_public_assets';
        const frontendDir = path.join(mountBase, 'photo_artiste');
        console.log('📁 Upload artiste (DEV) → frontendDir =', frontendDir);
        await fs.promises.mkdir(frontendDir, { recursive: true });

        // Construire un nom basé sur le nom original, sécurisé et unique
        const original = (req.file.originalname || 'image').toString();
        const parsed = path.parse(original);
        const baseRaw = (parsed.name || 'image').toLowerCase();
        const baseSanitized = baseRaw
          .normalize('NFKD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s._-]/g, '')
          .replace(/[\s]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^[-_.]+|[-_.]+$/g, '') || 'image';

        let targetName = `${baseSanitized}.webp`;
        let targetAbs = path.join(frontendDir, targetName);
        let suffix = 1;
        while (fs.existsSync(targetAbs)) {
          targetName = `${baseSanitized}-${suffix}.webp`;
          targetAbs = path.join(frontendDir, targetName);
          suffix += 1;
        }
        const relativePath = `/assets/img/photo_artiste/${targetName}`;

        // Convertir en WEBP pour uniformiser
        await sharp(req.file.buffer).webp({ quality: 85 }).toFile(targetAbs);
        console.log('✅ Upload artiste écrit:', targetAbs);

        return res.json({ path: relativePath });
      }
    } catch (error) {
      console.error('Erreur upload image artiste:', error);
      return res.status(500).json({ error: 'Erreur serveur lors de l\'upload' });
    }
  });
}


// ====== Newsletter ======
// Récupérer tous les abonnés newsletter
router.get('/newsletter/subscribers', async (req, res) => {
  try {
    const [subscribers] = await db.query(
      'SELECT email, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC'
    );

    // Retourner seulement les emails pour simplifier
    const emails = subscribers.map(sub => sub.email);
    res.json(emails);

  } catch (error) {
    console.error('Erreur récupération abonnés:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des abonnés' });
  }
});

// Envoyer un email à tous les abonnés
router.post('/newsletter/send', async (req, res) => {
  try {
    const { subject, message, recipients } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Sujet et message requis' });
    }

    let emails = [];

    if (recipients === 'newsletter') {
      // Récupérer les abonnés newsletter
      const [subscribers] = await db.query('SELECT email FROM newsletter_subscribers');
      emails = subscribers.map(sub => sub.email);
    } else if (recipients === 'all') {
      // Récupérer tous les utilisateurs
      const [users] = await db.query('SELECT email FROM user');
      emails = users.map(user => user.email);
    }

    if (emails.length === 0) {
      return res.status(400).json({ error: 'Aucun destinataire trouvé' });
    }

    console.log(`📧 Envoi de ${emails.length} emails newsletter`);
    console.log('📧 Sujet:', subject);
    console.log('📧 Destinataires:', emails);

    // Envoyer les emails avec le vrai service
    const results = await sendBulkEmails(emails, subject, message);
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`📧 Résultats: ${successCount} succès, ${failureCount} échecs`);

    res.json({ 
      success: true, 
      recipientsCount: emails.length,
      successCount,
      failureCount,
      results,
      message: `Emails envoyés: ${successCount} succès, ${failureCount} échecs`
    });

  } catch (error) {
    console.error('Erreur envoi newsletter:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de la newsletter' });
  }
});

// Désabonner un utilisateur de la newsletter (route admin)
router.post('/newsletter/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    // Vérifier si l'email existe dans la newsletter
    const [existing] = await db.query('SELECT id FROM newsletter_subscribers WHERE email = ?', [email]);
    if (existing.length === 0) {
      return res.status(400).json({ error: 'Cet email n\'est pas inscrit à la newsletter' });
    }

    // Désabonner l'utilisateur
    await db.query('DELETE FROM newsletter_subscribers WHERE email = ?', [email]);
    
    console.log('📧 Désabonnement admin newsletter:', email);
    
    res.json({ 
      success: true, 
      message: 'Désabonnement de la newsletter réussi !' 
    });
  } catch (error) {
    console.error('Erreur désabonnement admin newsletter:', error);
    res.status(500).json({ error: 'Erreur lors du désabonnement de la newsletter' });
  }
});

// ====== Paramètres (settings) ======
// Récupérer l'email destinataire des messages contact
router.get('/settings/contact-email', async (req, res) => {
  try {
    await db.query("CREATE TABLE IF NOT EXISTS settings (\n      `key` VARCHAR(100) PRIMARY KEY,\n      `value` TEXT,\n      `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n    )");
    const [rows] = await db.query('SELECT `value` FROM settings WHERE `key` = ? LIMIT 1', ['contact_recipient_email']);
    const envFallback = process.env.CONTACT_RECIPIENT_EMAIL || process.env.FROM_EMAIL || process.env.SMTP_USER || '';
    res.json({ email: (rows[0]?.value) || envFallback });
  } catch (error) {
    console.error('Erreur lecture contact-email:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mettre à jour l'email destinataire des messages contact
router.put('/settings/contact-email', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email invalide' });
    }
    await db.query("CREATE TABLE IF NOT EXISTS settings (\n      `key` VARCHAR(100) PRIMARY KEY,\n      `value` TEXT,\n      `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n    )");
    await db.query('INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)', ['contact_recipient_email', email]);
    res.json({ email });
  } catch (error) {
    console.error('Erreur maj contact-email:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Activer/désactiver la maintenance (admin)
router.put('/settings/maintenance', async (req, res) => {
  try {
    const { enabled } = req.body || {};
    const value = enabled ? '1' : '0';
    await db.query("CREATE TABLE IF NOT EXISTS settings (\n      `key` VARCHAR(100) PRIMARY KEY,\n      `value` TEXT,\n      `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n    )");
    await db.query('INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)', ['maintenance_enabled', value]);
    res.json({ maintenance_enabled: value === '1' });
  } catch (error) {
    console.error('Erreur maj maintenance:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer tous les spectacles (pour l'admin)
router.get('/spectacles', async (req, res) => {

  try {
    const [spectacles] = await db.query(`
      SELECT * FROM spectacle 
      ORDER BY date_spectacle DESC, heure_spectacle DESC
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

    const { title, img, description, date_spectacle, heure_spectacle, lieu, lien_spectacle, recurrence } = req.body;

    if (!title || !img || !description || !lieu) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    try {
      // Si pas de récurrence: insertion simple
      if (!recurrence || !recurrence.enabled) {
        if (!date_spectacle || !heure_spectacle) {
          return res.status(400).json({ error: 'date_spectacle et heure_spectacle requis pour un ajout simple' });
        }
        const [result] = await db.query(
            'INSERT INTO spectacle (title, img, description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, img, description, date_spectacle, heure_spectacle, lieu, lien_spectacle || null]
        );
      
      const [newSpectacle] = await db.query(
        'SELECT * FROM spectacle WHERE id = ?',
        [result.insertId]
      );


      return res.status(201).json(newSpectacle[0]);
      }

      // Récurrence hebdomadaire
      const { weekday, time, startDate, endDate } = recurrence || {};
      if (typeof weekday !== 'number' || !time || !startDate || !endDate) {
        return res.status(400).json({ error: 'Paramètres de récurrence invalides' });
      }

      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T23:59:59');
      const dates = [];
      let d = new Date(start);
      while (d.getDay() !== weekday) {
        d.setDate(d.getDate() + 1);
      }
      while (d <= end) {
        dates.push(new Date(d));
        d = new Date(d);
        d.setDate(d.getDate() + 7);
      }
      if (dates.length === 0) {
        return res.status(400).json({ error: 'Aucune occurrence dans l\'intervalle' });
      }
      const values = dates.map(dt => [
        title,
        img,
        description,
        dt.toISOString().slice(0,10),
        time.length === 'HH:mm'.length ? time + ':00' : time,
        lieu,
        lien_spectacle || null,
      ]);
      await db.query(
        'INSERT INTO spectacle (title, img, description, date_spectacle, heure_spectacle, lieu, lien_spectacle) VALUES ?',
        [values]
      );
      return res.status(201).json({ success: true, inserted: values.length });
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

  const { title, img, description, date_spectacle, heure_spectacle, lieu, lien_spectacle } = req.body;

  if (!title || !img || !description || !date_spectacle || !heure_spectacle || !lieu) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    await db.query(
      'UPDATE spectacle SET title = ?, img = ?, description = ?, date_spectacle = ?, heure_spectacle = ?, lieu = ?, lien_spectacle = ? WHERE id = ?',
      [title, img, description, date_spectacle, heure_spectacle, lieu, lien_spectacle || null, id]
    );

    const [updatedSpectacle] = await db.query(
      'SELECT * FROM spectacle WHERE id = ?',
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
    // 1. Récupérer les informations du spectacle avant suppression
    const [spectacleInfo] = await db.query(`
      SELECT s.*
      FROM spectacle s 
      WHERE s.id = ?
    `, [id]);

    if (spectacleInfo.length === 0) {
      return res.status(404).json({ error: 'Spectacle non trouvé' });
    }

    const spectacle = spectacleInfo[0];

    // 2. Supprimer uniquement le spectacle (pas d'appels à reservation/paiement)
    await db.query('DELETE FROM spectacle WHERE id = ?', [id]);

    res.json({ 
      message: 'Spectacle supprimé avec succès',
      spectacleSupprime: spectacle.title
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du spectacle:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer tous les artistes (pour l'admin)
router.get('/artistes', async (req, res) => {
  try {
    const [artistes] = await db.query(`
      SELECT a.*, 0 as upcoming_shows
      FROM artiste a
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
  const { name, photo } = req.body;

  if (!name || !photo) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    await db.query(
      'UPDATE artiste SET name = ?, photo = ? WHERE id = ?',
      [name, photo, id]
    );

    const [updatedArtist] = await db.query(
      `SELECT a.*, 0 as upcoming_shows
       FROM artiste a
       WHERE a.id = ?`,
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
    // Vérifier si l'artiste existe
    const [artiste] = await db.query('SELECT id FROM artiste WHERE id = ?', [id]);
    if (artiste.length === 0) {
      return res.status(404).json({ 
        error: 'Artiste non trouvé' 
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
  const { name, photo } = req.body;

  console.log('🎭 Ajout artiste - name:', name, '| photo:', photo);

  if (!name || !photo) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    // Vérifier la structure de la table
    console.log('🔍 Vérification structure table artiste...');
    const [tableInfo] = await db.query('DESCRIBE artiste');
    console.log('📋 Structure table artiste:', tableInfo);
    
    console.log('📝 Insertion artiste en base...');
    const [result] = await db.query(
      'INSERT INTO artiste (name, photo) VALUES (?, ?)',
      [name, photo]
    );

    console.log('✅ Insertion réussie - ID:', result.insertId);

    const [newArtist] = await db.query(
      `SELECT a.*, 0 as upcoming_shows
       FROM artiste a
       WHERE a.id = ?`,
      [result.insertId]
    );

    console.log('📋 Artiste récupéré:', newArtist[0]);
    res.status(201).json(newArtist[0]);
  } catch (error) {
    console.error('❌ Erreur détaillée lors de l\'ajout de l\'artiste:', error);
    console.error('❌ Code erreur:', error.code);
    console.error('❌ Message erreur:', error.message);
    console.error('❌ SQL State:', error.sqlState);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// Récupérer l'artiste à l'affiche (automatique)
router.get('/featured', async (req, res) => {
  try {
    // Sélectionner le prochain spectacle à venir et son artiste
    const [rows] = await db.query(`
      SELECT s.id as next_show_id, s.title as next_show_title, s.date_spectacle as next_show_date, s.heure_spectacle as next_show_time
      FROM spectacle s
      WHERE TIMESTAMP(s.date_spectacle, s.heure_spectacle) >= CONVERT_TZ(NOW(), 'UTC', 'Europe/Paris')
      ORDER BY s.date_spectacle ASC, s.heure_spectacle ASC
      LIMIT 1
    `);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Aucun spectacle à venir" });
    }
    const spectacle = rows[0];
    const response = {
      id: 1,
      name: "Artiste à l'affiche",
      photo: "default-artist.jpg",
      biographie: "Artiste en vedette pour ce spectacle",
      next_show: {
        id: spectacle.next_show_id,
        title: spectacle.next_show_title,
        date: spectacle.next_show_date,
        time: spectacle.next_show_time
      }
    };
    res.json(response);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'artiste à l'affiche:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Récupérer tous les utilisateurs (pour l'admin)
router.get('/users', async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT 
        id,
        email,
        civility,
        prenom as firstName,
        nom as lastName,
        role,
        dateNaissance as birthDate,
        isActive,
        created_at as createdAt,
        last_login as lastLogin
      FROM user 
      ORDER BY created_at DESC
    `);
    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un utilisateur (pour l'admin)
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifier que l'utilisateur n'est pas admin
    const [user] = await db.query('SELECT role FROM user WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    if (user[0].role === 'admin') {
      return res.status(403).json({ error: 'Impossible de supprimer un administrateur' });
    }

    // Vérifier que l'utilisateur n'a pas de réservations
    const [reservations] = await db.query('SELECT id FROM reservation WHERE user_id = ?', [id]);
    if (reservations.length > 0) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer cet utilisateur car il a des réservations associées' 
      });
    }

    const [result] = await db.query('DELETE FROM user WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Changer le statut d'un utilisateur (actif/suspendu)
router.put('/users/:id/status', async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ error: 'Le statut doit être un booléen' });
  }

  try {
    // Vérifier que l'utilisateur existe
    const [user] = await db.query('SELECT id FROM user WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    await db.query('UPDATE user SET isActive = ? WHERE id = ?', [isActive, id]);
    res.json({ message: `Utilisateur ${isActive ? 'activé' : 'suspendu'} avec succès` });
  } catch (error) {
    console.error('Erreur lors du changement de statut de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Routes pour les codes promo
router.get('/promo-codes', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id, code, type, value, description, is_active, 
        max_uses, current_uses, valid_from, valid_until,
        created_at, updated_at
      FROM promo_codes 
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des codes promo:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/promo-codes', async (req, res) => {
  try {
    const { code, type, value, description, is_active, max_uses, valid_from, valid_until } = req.body;
    
    // Vérifier que le code n'existe pas déjà
    const [existingCodes] = await db.query('SELECT id FROM promo_codes WHERE code = ?', [code]);
    if (existingCodes.length > 0) {
      return res.status(400).json({ error: 'Ce code promo existe déjà' });
    }

    const [result] = await db.query(`
      INSERT INTO promo_codes (code, type, value, description, is_active, max_uses, valid_from, valid_until, current_uses)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `, [code, type, value, description, is_active, max_uses || null, valid_from, valid_until, 0]);

    const [newCode] = await db.query('SELECT * FROM promo_codes WHERE id = ?', [result.insertId]);
    res.status(201).json(newCode[0]);
  } catch (error) {
    console.error('Erreur lors de la création du code promo:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/promo-codes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code, type, value, description, is_active, max_uses, valid_from, valid_until } = req.body;
    
    // Vérifier que le code n'existe pas déjà (sauf pour ce code)
    const [existingCodes] = await db.query('SELECT id FROM promo_codes WHERE code = ? AND id != ?', [code, id]);
    if (existingCodes.length > 0) {
      return res.status(400).json({ error: 'Ce code promo existe déjà' });
    }

    await db.query(`
      UPDATE promo_codes 
      SET code = ?, type = ?, value = ?, description = ?, is_active = ?, 
          max_uses = ?, valid_from = ?, valid_until = ?, updated_at = NOW()
      WHERE id = ?
    `, [code, type, value, description, is_active, max_uses || null, valid_from, valid_until, id]);

    const [updatedCode] = await db.query('SELECT * FROM promo_codes WHERE id = ?', [id]);
    res.json(updatedCode[0]);
  } catch (error) {
    console.error('Erreur lors de la modification du code promo:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/promo-codes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM promo_codes WHERE id = ?', [id]);
    res.json({ message: 'Code promo supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du code promo:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router; 