const express = require("express");
const router = express.Router();

const { router: authRoutes } = require("./auth");
const spectaclesRoutes = require("./spectacles");
const artistesRoutes = require("./artistes");
const adminRoutes = require("./admin");
const reservationsRoutes = require("./reservations");
const lieuRoutes = require("./lieu");
const contactRoutes = require("./contact");

router.use("/auth", authRoutes);
router.use("/spectacles", spectaclesRoutes);  // <-- ajout
router.use("/artistes", artistesRoutes);
router.use("/admin", adminRoutes);
router.use("/reservations", reservationsRoutes);
router.use("/lieu", lieuRoutes);
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
    
    // Vérifier si l'email existe dans la table users
    const [users] = await db.query('SELECT id, email FROM users WHERE email = ?', [email]);
    const hasAccount = users.length > 0;
    
    // Vérifier si l'email est inscrit à la newsletter
    const [subscribers] = await db.query('SELECT id FROM newsletter_subscribers WHERE email = ?', [email]);
    const isSubscribed = subscribers.length > 0;
    
    res.json({ 
      hasAccount, 
      isSubscribed,
      email 
    });
  } catch (error) {
    console.error('Erreur vérification utilisateur:', error);
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
    if (existing.length === 0) {
      return res.status(400).json({ error: 'Cet email n\'est pas inscrit à la newsletter' });
    }

    // Vérifier si l'utilisateur a un compte
    const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    const hasAccount = users.length > 0;

    if (hasAccount) {
      // L'utilisateur a un compte, retourner une erreur pour forcer la redirection
      return res.status(403).json({ 
        error: 'Authentication required',
        hasAccount: true,
        message: 'Vous avez un compte. Veuillez vous connecter pour vous désabonner.'
      });
    }

    // L'utilisateur n'a pas de compte, désabonner directement
    await db.query('DELETE FROM newsletter_subscribers WHERE email = ?', [email]);
    
    console.log('📧 Désabonnement direct newsletter:', email);
    
    res.json({ 
      success: true, 
      hasAccount: false,
      message: 'Désabonnement de la newsletter réussi !' 
    });
  } catch (error) {
    console.error('Erreur désabonnement newsletter:', error);
    res.status(500).json({ error: 'Erreur lors du désabonnement de la newsletter' });
  }
});

module.exports = router;
