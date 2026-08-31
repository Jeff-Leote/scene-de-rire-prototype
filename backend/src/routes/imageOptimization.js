const express = require('express');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

/**
 * GET /api/images/optimize/:category/:filename
 * Optimise une image à la volée avec paramètres de compression
 */
router.get('/optimize/:category/:filename', async (req, res) => {
  try {
    const { category, filename } = req.params;
    const { w, h, q = 80 } = req.query;

    // Chemin vers l'image originale
    const originalPath = path.join(__dirname, '../../frontend/public/assets/img', category, filename);

    // Vérifier si l'image existe
    try {
      await fs.access(originalPath);
    } catch {
      return res.status(404).json({ error: 'Image non trouvée' });
    }

    // Paramètres d'optimisation
    const width = w ? parseInt(w) : undefined;
    const height = h ? parseInt(h) : undefined;
    const quality = parseInt(q);

    // Créer le dossier de cache s'il n'existe pas
    const cacheDir = path.join(__dirname, '../../frontend/public/assets/img-optimized', category);
    await fs.mkdir(cacheDir, { recursive: true });

    // Nom du fichier optimisé
    const optimizedFilename = `${path.parse(filename).name}_${width || 'auto'}x${height || 'auto'}_q${quality}.webp`;
    const optimizedPath = path.join(cacheDir, optimizedFilename);

    // Vérifier si l'image optimisée existe déjà
    try {
      await fs.access(optimizedPath);
      return res.sendFile(optimizedPath);
    } catch {
      // L'image optimisée n'existe pas, la créer
    }

    // Optimiser l'image
    let pipeline = sharp(originalPath);

    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit: 'cover',
        withoutEnlargement: true,
      });
    }

    // Convertir en WebP avec compression
    pipeline = pipeline.webp({ quality });

    // Sauvegarder l'image optimisée
    await pipeline.toFile(optimizedPath);

    // Envoyer l'image optimisée
    res.sendFile(optimizedPath);
  } catch (error) {
    console.error("Erreur lors de l'optimisation:", error);
    res.status(500).json({ error: "Erreur lors de l'optimisation de l'image" });
  }
});

/**
 * POST /api/images/batch-optimize
 * Optimise toutes les images d'un dossier
 */
router.post('/batch-optimize', async (req, res) => {
  try {
    const { category } = req.body;
    const imagesDir = path.join(__dirname, '../../frontend/public/assets/img', category);

    const files = await fs.readdir(imagesDir);
    const imageFiles = files.filter((file) => /\.(jpe?g|png|webp)$/i.test(file));

    const results = [];

    for (const file of imageFiles) {
      const inputPath = path.join(imagesDir, file);
      const outputDir = path.join(__dirname, '../../frontend/public/assets/img-optimized', category);
      await fs.mkdir(outputDir, { recursive: true });

      const outputPath = path.join(outputDir, file.replace(/\.(jpe?g|png)$/i, '.webp'));

      try {
        await sharp(inputPath).webp({ quality: 75 }).toFile(outputPath);

        const originalStats = await fs.stat(inputPath);
        const optimizedStats = await fs.stat(outputPath);

        results.push({
          file,
          originalSize: originalStats.size,
          optimizedSize: optimizedStats.size,
          savings: originalStats.size - optimizedStats.size,
          percentage: Math.round(((originalStats.size - optimizedStats.size) / originalStats.size) * 100),
        });
      } catch (error) {
        results.push({
          file,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      results,
      message: 'Optimisation par lot terminée',
    });
  } catch (error) {
    console.error("Erreur lors de l'optimisation par lot:", error);
    res.status(500).json({ error: "Erreur lors de l'optimisation par lot" });
  }
});

module.exports = router;
