#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports -- script Node CommonJS autonome, exécuté hors du bundle Next.js */
/**
 * Recompresse les images de web/public/assets/img/ : beaucoup sont en réalité du JPEG
 * ré-étiqueté ".webp" (jamais vraiment réencodé), à une résolution bien supérieure à leur
 * usage réel sur le site (ex: 4096px de large pour un logo affiché à 256px).
 *
 * Redimensionne (jamais à la hausse) selon un plafond par dossier, puis réencode en vrai
 * WebP qualité 75. Écrase les fichiers en place (mêmes noms, aucun code à changer).
 *
 * Usage : node scripts/optimize-images.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.join(__dirname, '..', 'public', 'assets', 'img');
const QUALITY = 75;

const MAX_WIDTH_BY_FOLDER = {
  spectacles: 1920,
  image_path: 1600,
  photo_additionnel: 1000,
  photo_artiste: 800,
};
const DEFAULT_MAX_WIDTH = 1920;
const LOGO_MAX_WIDTH = 512;

function maxWidthFor(filePath) {
  const relative = path.relative(ASSETS_DIR, filePath);
  const folder = relative.split(path.sep)[0];
  if (folder.toLowerCase().includes('logo')) return LOGO_MAX_WIDTH;
  return MAX_WIDTH_BY_FOLDER[folder] || DEFAULT_MAX_WIDTH;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function writeWithRetry(file, buffer, attempts = 5) {
  const tmpFile = `${file}.tmp`;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      fs.writeFileSync(tmpFile, buffer);
      fs.renameSync(tmpFile, file);
      return;
    } catch (error) {
      if (attempt === attempts) throw error;
      await sleep(300 * attempt);
    }
  }
}

function listWebpFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listWebpFiles(fullPath));
    } else if (entry.name.toLowerCase().endsWith('.webp')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  const files = listWebpFiles(ASSETS_DIR);
  let totalBefore = 0;
  let totalAfter = 0;

  const failures = [];

  for (const file of files) {
    const relative = path.relative(ASSETS_DIR, file);
    const before = fs.statSync(file).size;
    try {
      const maxWidth = path.basename(file).toLowerCase().includes('logo') ? LOGO_MAX_WIDTH : maxWidthFor(file);

      const image = sharp(file);
      const metadata = await image.metadata();
      const resized = metadata.width && metadata.width > maxWidth ? image.resize({ width: maxWidth }) : image;
      const buffer = await resized.webp({ quality: QUALITY }).toBuffer();

      await writeWithRetry(file, buffer);
      const after = buffer.length;

      totalBefore += before;
      totalAfter += after;

      const pct = (((before - after) / before) * 100).toFixed(0);
      console.log(`${relative}: ${(before / 1024).toFixed(0)} Ko -> ${(after / 1024).toFixed(0)} Ko (-${pct}%)`);
    } catch (error) {
      failures.push(relative);
      totalBefore += before;
      totalAfter += before;
      console.warn(`${relative}: échec (conservé tel quel) -`, error.message);
    }
  }

  if (failures.length > 0) {
    console.log('\nFichiers non traités (déjà petits ou verrouillés) :', failures.join(', '));
  }

  console.log('\nTotal:', (totalBefore / 1024 / 1024).toFixed(2), 'Mo ->', (totalAfter / 1024 / 1024).toFixed(2), 'Mo');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
