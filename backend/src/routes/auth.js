const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Middleware d'authentification
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'Apres_lheure_cest_plus_lheure_franchement');

    const [users] = await db.query('SELECT * FROM user WHERE id = ?', [decoded.id]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

// Middleware de vérification du rôle admin
const isAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès non autorisé' });
  }
  next();
};

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!' });
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  try {
    const [users] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const token = jwt.sign({
      id: user.id,
      email: user.email,
      civility: user.civility,
      firstName: user.prenom,
      lastName: user.nom,
      role: user.role
    }, process.env.JWT_SECRET || 'Apres_lheure_cest_plus_lheure_franchement', { expiresIn: '3h' });

    return res.status(200).json({
      message: 'Connexion réussie !',
      token,
      user: {
        id: user.id,
        email: user.email,
        civility: user.civility,
        firstName: user.prenom,
        lastName: user.nom,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la connexion.', details: error.message });
  }
});

// Register route
router.post('/register', async (req, res) => {
  const { civility, firstName, lastName, birthDate, email, password } = req.body;

  if (!email || !password || !firstName || !lastName || !birthDate || !civility) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  try {
    const [existingUsers] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Email déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const formattedDate = new Date(birthDate).toISOString().split('T')[0];

    const sql = `INSERT INTO user (civility, prenom, nom, dateNaissance, email, password)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    
    const values = [civility, firstName, lastName, formattedDate, email, hashedPassword];
    await db.query(sql, values);

    return res.status(201).json({ message: 'Utilisateur créé avec succès 🎉' });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de l\'inscription.', details: error.message });
  }
});

// Update profile route
router.put('/update-profile', auth, async (req, res) => {
  const { id, civility, firstName, lastName, email } = req.body;

  if (!id || !civility || !firstName || !lastName || !email) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  try {
    // Vérifier si l'utilisateur existe
    const [existingUser] = await db.query('SELECT * FROM user WHERE id = ?', [id]);
    
    if (existingUser.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    const [existingUsers] = await db.query(
      'SELECT * FROM user WHERE email = ? AND id != ?',
      [email, id]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé par un autre compte.' });
    }

    const sql = `UPDATE user 
                 SET civility = ?, 
                     prenom = ?, 
                     nom = ?, 
                     email = ?
                 WHERE id = ?`;
    
    await db.query(sql, [civility, firstName, lastName, email, id]);

    const token = jwt.sign({
      id,
      email,
      civility,
      firstName,
      lastName,
      role: existingUser[0].role
    }, process.env.JWT_SECRET || 'Apres_lheure_cest_plus_lheure_franchement', { expiresIn: '3h' });

    return res.status(200).json({
      message: 'Profil mis à jour avec succès !',
      token,
      user: {
        id,
        email,
        civility,
        firstName,
        lastName,
        role: existingUser[0].role
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la mise à jour du profil.', details: error.message });
  }
});

// Vérifie si le token est encore valide et l'utilisateur toujours en base
router.get("/me", auth, async (req, res) => {
  return res.status(200).json({
    id: req.user.id,
    email: req.user.email,
    civility: req.user.civility,
    firstName: req.user.prenom,
    lastName: req.user.nom,
    role: req.user.role
  });
});

// Delete account route
router.delete('/delete-account', auth, async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID utilisateur requis.' });
  }

  try {
    // Vérifier si l'utilisateur existe
    const [existingUser] = await db.query('SELECT * FROM user WHERE id = ?', [id]);
    
    if (existingUser.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    // Supprimer l'utilisateur
    await db.query('DELETE FROM user WHERE id = ?', [id]);

    return res.status(200).json({ message: 'Compte supprimé avec succès.' });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la suppression du compte.', details: error.message });
  }
});

module.exports = { router, auth, isAdmin };
