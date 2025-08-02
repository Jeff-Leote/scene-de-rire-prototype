//server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();
const PORT = process.env.DB_PORT || 5000;

// Middleware de base
app.use(cors({
  origin: "https://scene-de-rire-prototype.onrender.com",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Configuration du body parser
app.use(express.json());  

app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Routes API
app.use("/api", routes);

// Route de test
app.get("/", (req, res) => {
  res.json({ message: "API is working!" });
});

app.get("/jwt",(req, res) => {
  res.send("JWT")
})

// Gestion des routes non trouvées
app.use((req, res) => {
  console.log('Route not found:', req.method, req.url);
  res.status(404).json({ error: 'Route not found' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  if (!err) {
    console.error('[ERROR HANDLER] Middleware called without error object.');
    return res.status(500).json({
      error: 'Internal Server Error',
      details: 'Erreur inconnue (aucun objet d\'erreur fourni).'
    });
  }

  console.error('[ERROR HANDLER]', err);

  const errorDetails = {
    message: err.message || 'Une erreur inconnue est survenue',
    name: err.name || 'Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack || 'Stack inconnue' })
  };

  res.status(500).json({
    error: 'Internal Server Error',
    details: errorDetails.message
  });
});


// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur http://localhost:${PORT}`);
});
