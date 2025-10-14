const express = require("express");
const router = express.Router();

const { router: authRoutes } = require("./auth");
const spectaclesRoutes = require("./spectacles");
const artistesRoutes = require("./artistes");
const adminRoutes = require("./admin");
// Reservations/payments have been removed
// const reservationsRoutes = require("./reservations");
const lieuRoutes = require("./lieu");
const contactRoutes = require("./contact");
const photosRoutes = require("./photos");
const publicSettingsRoutes = require("./publicSettings");

router.use("/auth", authRoutes);
router.use("/spectacles", spectaclesRoutes);  // <-- ajout
router.use("/artistes", artistesRoutes);
router.use("/admin", adminRoutes);
// router.use("/reservations", reservationsRoutes);
router.use("/lieu", lieuRoutes);
router.use("/photos", photosRoutes);
router.use("/settings", publicSettingsRoutes);
router.use("/contact", contactRoutes);

// Route publique pour s'abonner à la newsletter
router.post('/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    const db = require('../db');
    
    // Vérifier si l'email existe déjà
    const [existing] = await db.query('SELECT id FROM newsletter_subscribers WHERE email = ?', [email]);
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà inscrit à la newsletter' });
    }

    // Ajouter l'email à la newsletter
    await db.query('INSERT INTO newsletter_subscribers (email) VALUES (?)', [email]);
    
    console.log('📧 Nouvel abonné newsletter:', email);
    
    // Envoyer un email de confirmation de bienvenue
    try {
      const { sendEmail } = require('../services/emailService');
      await sendEmail(
        email, 
        'Bienvenue dans la newsletter Espace Comédie !', 
        `Bonjour,\n\nMerci de vous être inscrit à notre newsletter ! Vous recevrez désormais nos actualités, les prochains spectacles et nos offres exclusives.\n\nÀ bientôt pour de bons moments de rire !\n\nL'équipe Espace Comédie`,
        [], // pas d'attachments
        true // avec lien de désabonnement
      );
      console.log('📧 Email de bienvenue envoyé à:', email);
    } catch (emailError) {
      console.error('📧 Erreur envoi email de bienvenue:', emailError.message);
      // On continue même si l'email échoue, l'inscription est déjà faite
    }
    
    res.json({ success: true, message: 'Inscription à la newsletter réussie !' });
  } catch (error) {
    console.error('Erreur inscription newsletter:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription à la newsletter' });
  }
});

// Route pour vérifier si un utilisateur a un compte
router.get('/newsletter/check-user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    const db = require('../db');
    
    // Vérifier si l'email existe dans la table user
    let hasAccount = false;
    try {
      const [users] = await db.query('SELECT id, email FROM user WHERE email = ?', [email]);
      hasAccount = users.length > 0;
    } catch (err) {
      console.error('Erreur lecture table user:', err?.message);
    }
    
    // Vérifier si l'email est inscrit à la newsletter
    const [subscribers] = await db.query('SELECT id FROM newsletter_subscribers WHERE email = ?', [email]);
    const isSubscribed = subscribers.length > 0;
    
    res.json({ 
      hasAccount, 
      isSubscribed,
      email 
    });
  } catch (error) {
    console.error('Erreur vérification utilisateur (check-user):', error);
    res.status(500).json({ error: 'Erreur lors de la vérification' });
  }
});

// Route publique pour se désabonner de la newsletter
router.post('/newsletter/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    const db = require('../db');
    
    // Vérifier si l'email existe dans la newsletter
    const [existing] = await db.query('SELECT id FROM newsletter_subscribers WHERE email = ?', [email]);

    // Vérifier si l'utilisateur a un compte
    let hasAccount = false;
    try {
      const [users] = await db.query('SELECT id FROM user WHERE email = ?', [email]);
      hasAccount = users.length > 0;
    } catch (err) {
      console.error('Erreur lecture table user:', err?.message);
    }

    // Désabonner directement (que l'utilisateur ait un compte ou non)
    await db.query('DELETE FROM newsletter_subscribers WHERE email = ?', [email]);
    
    console.log('📧 Désabonnement direct newsletter:', email);
    
    res.json({ 
      success: true, 
      hasAccount: false,
      message: existing.length > 0 ? 'Désabonnement de la newsletter réussi !' : 'Adresse déjà non inscrite. Aucun changement.' 
    });
  } catch (error) {
    console.error('Erreur désabonnement newsletter:', error);
    res.status(500).json({ error: 'Erreur lors du désabonnement de la newsletter' });
  }
});

module.exports = router;
