//server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://scene-de-rire-prototype.onrender.com",
  "https://scene-de-rire-prototype-1.onrender.com",
  "https://espacecomedie.fr",
  "https://www.espacecomedie.fr" // si tu utilises aussi le www
];

app.use(cors({
  origin: function(origin, callback){
    // autoriser requêtes sans origin (ex: Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `L'origine ${origin} n'est pas autorisée par la politique CORS.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configuration du body parser
app.use(express.json());  

app.use(express.urlencoded({ extended: true }));

// Middleware de logging minimal en production
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  }
  next();
});

// Routes API
app.use("/api", routes);

// Route de base
app.get("/", (req, res) => {
  res.json({ message: "API is working!" });
});

// Gestion des routes non trouvées
app.use((req, res) => {
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
