#!/usr/bin/env node

/**
 * 🚀 Script de Build Optimisé pour la Production
 * Optimise le build frontend pour les meilleures performances
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Démarrage du build optimisé pour la production...');

// 1. Nettoyage du dossier dist
console.log('🧹 Nettoyage du dossier dist...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
  console.log('✅ Dossier dist supprimé');
}

// 2. Vérification des dépendances
console.log('📦 Vérification des dépendances...');
try {
  execSync('npm ci', { stdio: 'inherit' }); // Installer toutes les dépendances
  console.log('✅ Dépendances installées');
} catch (error) {
  console.log('⚠️ Erreur lors de l\'installation des dépendances, tentative avec npm install...');
  execSync('npm install', { stdio: 'inherit' });
}

// 3. Build optimisé
console.log('🔨 Build optimisé en cours...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build terminé avec succès');
} catch (error) {
  console.error('❌ Erreur lors du build');
  process.exit(1);
}

// 4. Analyse de la taille des bundles
console.log('📊 Analyse de la taille des bundles...');
const distPath = path.join(__dirname, 'dist');
const assetsPath = path.join(distPath, 'assets');

if (fs.existsSync(assetsPath)) {
  const files = fs.readdirSync(assetsPath);
  let totalSize = 0;
  
  files.forEach(file => {
    const filePath = path.join(assetsPath, file);
    const stats = fs.statSync(filePath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    totalSize += stats.size;
    
    if (file.endsWith('.js')) {
      console.log(`📦 ${file}: ${sizeInMB} MB`);
    } else if (file.endsWith('.css')) {
      console.log(`🎨 ${file}: ${sizeInMB} MB`);
    }
  });
  
  const totalSizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
  console.log(`📊 Taille totale: ${totalSizeInMB} MB`);
  
  // Vérification des bonnes pratiques
  if (totalSize > 2 * 1024 * 1024) { // 2MB
    console.log('⚠️ Attention: La taille totale dépasse 2MB, considérez l\'optimisation');
  } else {
    console.log('✅ Taille optimale pour la production');
  }
}

// 5. Vérification des fichiers critiques
console.log('🔍 Vérification des fichiers critiques...');
const criticalFiles = ['index.html', 'assets/index-', 'assets/index-'];
let allCriticalFilesPresent = true;

criticalFiles.forEach(file => {
  if (file === 'index.html') {
    if (!fs.existsSync(path.join(distPath, file))) {
      console.log(`❌ ${file} manquant`);
      allCriticalFilesPresent = false;
    }
  } else {
    const assets = fs.readdirSync(assetsPath);
    const hasMatchingFile = assets.some(asset => asset.startsWith(file.replace('assets/', '')));
    if (!hasMatchingFile) {
      console.log(`❌ Fichier commençant par ${file} manquant`);
      allCriticalFilesPresent = false;
    }
  }
});

if (allCriticalFilesPresent) {
  console.log('✅ Tous les fichiers critiques sont présents');
} else {
  console.log('❌ Certains fichiers critiques sont manquants');
  process.exit(1);
}

// 6. Optimisations finales
console.log('⚡ Optimisations finales...');

// Compression des images (si possible)
try {
  if (fs.existsSync('scripts/optimize-images.js')) {
    execSync('node scripts/optimize-images.js', { stdio: 'inherit' });
    console.log('✅ Images optimisées');
  }
} catch (error) {
  console.log('ℹ️ Script d\'optimisation d\'images non trouvé, ignoré');
}

console.log('🎉 Build de production terminé avec succès !');
console.log('📁 Dossier dist prêt pour le déploiement');
console.log('🚀 Votre application est optimisée pour la production !');
