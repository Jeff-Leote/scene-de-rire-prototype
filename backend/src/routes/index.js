// routes/index.js
const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");

// Utiliser le préfixe /auth pour toutes les routes d'authentification
router.use("/auth", authRoutes);

module.exports = router;
