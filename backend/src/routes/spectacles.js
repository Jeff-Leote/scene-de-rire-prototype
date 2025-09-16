const express = require("express");
const router = express.Router();
const pool = require("../db");

// Route pour la liste paginée (6 par page)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const offset = (page - 1) * limit;

    const [spectacles] = await pool.query(`
      SELECT 
        spectacle.id,
        spectacle.title,
        spectacle.img,
        spectacle.description,
        spectacle.date_spectacle,
        spectacle.heure_spectacle,
        spectacle.lieu,
        spectacle.lien_spectacle
      FROM spectacle
      WHERE spectacle.date_spectacle >= CURDATE()
      ORDER BY spectacle.date_spectacle ASC, spectacle.heure_spectacle ASC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const [[{ total }]] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM spectacle 
      WHERE date_spectacle >= CURDATE()
    `);

    res.json({
      spectacles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Erreur lors de la récupération des spectacles :", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des spectacles" });
  }
});

// Route pour les 3 prochains spectacles (sans pagination)
router.get("/upcoming", async (req, res) => {
  try {
    const limit = 4;


    const [rows] = await pool.query(`
      SELECT
        spectacle.id,
        spectacle.title,
        spectacle.img,
        spectacle.description,
        spectacle.date_spectacle,
        spectacle.heure_spectacle,
        spectacle.lieu,
        spectacle.lien_spectacle
      FROM spectacle
      WHERE spectacle.date_spectacle >= CURDATE()
      ORDER BY spectacle.date_spectacle ASC, spectacle.heure_spectacle ASC
      LIMIT ?
    `, [limit]);



    res.json(rows);  // direct tableau, pour UpcomingShows.tsx
  } catch (err) {
    console.error("Erreur lors de la récupération des spectacles à venir :", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des spectacles à venir" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        spectacle.id,
        spectacle.title,
        spectacle.img,
        spectacle.description,
        spectacle.date_spectacle,
        spectacle.heure_spectacle,
        spectacle.lieu,
        spectacle.lien_spectacle
      FROM spectacle
      ORDER BY spectacle.date_spectacle ASC, spectacle.heure_spectacle ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error("Erreur lors de la récupération de tous les spectacles :", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération de tous les spectacles" });
  }
});

// Route pour récupérer un spectacle spécifique
router.get("/:id", async (req, res) => {
  try {
    const [spectacles] = await pool.query(`
      SELECT 
        spectacle.id,
        spectacle.title,
        spectacle.img,
        spectacle.description,
        spectacle.date_spectacle,
        spectacle.heure_spectacle,
        spectacle.lieu,
        spectacle.lien_spectacle
      FROM spectacle
      WHERE spectacle.id = ?
    `, [req.params.id]);

    if (spectacles.length === 0) {
      return res.status(404).json({ error: "Spectacle non trouvé" });
    }

    res.json(spectacles[0]);
  } catch (err) {
    console.error("Erreur lors de la récupération du spectacle :", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération du spectacle" });
  }
});

module.exports = router;
