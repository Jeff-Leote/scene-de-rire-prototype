const express = require("express");
const router = express.Router();
const pool = require("../db");

// Route pour la liste paginée (6 par page)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const offset = (page - 1) * limit;

    // Ajout du filtre "futurs uniquement"
    const [spectacles] = await pool.query(`
      SELECT 
        spectacle.id,
        spectacle.title,
        spectacle.img,
        spectacle.description,
        spectacle.date,
        spectacle.prix,
        spectacle.lieu,
        spectacle.artiste_id,
        artiste.name AS artiste_name,
        artiste.photo AS artiste_photo
      FROM spectacle
      JOIN artiste ON spectacle.artiste_id = artiste.id
      WHERE spectacle.date >= NOW() -- ✅ ne garde que les spectacles à venir
      ORDER BY spectacle.date ASC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    // Compte seulement les spectacles à venir
    const [[{ total }]] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM spectacle 
      WHERE date >= NOW()
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
    console.log("Fetching upcoming shows with limit:", limit);

    const [rows] = await pool.query(`
      SELECT
        spectacle.id,
        spectacle.title,
        spectacle.img,
        spectacle.description,
        spectacle.date,
        spectacle.prix,
        spectacle.lieu,
        spectacle.artiste_id,
        artiste.name AS artiste_name,
        artiste.photo AS artiste_photo
      FROM spectacle
      JOIN artiste ON spectacle.artiste_id = artiste.id
      WHERE spectacle.date >= NOW()
      ORDER BY spectacle.date ASC
      LIMIT ?
    `, [limit]);

    console.log("Number of shows found:", rows.length);
    console.log("Shows:", rows);

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
        spectacle.date,
        spectacle.prix,
        spectacle.lieu,
        spectacle.artiste_id,
        artiste.name AS artiste_name,
        artiste.photo AS artiste_photo
      FROM spectacle
      JOIN artiste ON spectacle.artiste_id = artiste.id
      ORDER BY spectacle.date ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error("Erreur lors de la récupération de tous les spectacles :", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération de tous les spectacles" });
  }
});

module.exports = router;
