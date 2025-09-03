#!/usr/bin/env node

/**
 * 🔍 Script de Diagnostic Backend pour la Production
 * Identifie les problèmes causant les erreurs 500
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Démarrage du diagnostic backend...');

// 1. Vérification de l'environnement
console.log('\n📋 Vérification de l\'environnement...');
const env = process.env.NODE_ENV || 'development';
console.log(`🌍 Environnement: ${env}`);

// Variables d'environnement critiques
const criticalEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
const missingVars = criticalEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`❌ Variables d'environnement manquantes: ${missingVars.join(', ')}`);
} else {
  console.log('✅ Toutes les variables d\'environnement sont définies');
}

// 2. Test de connexion à la base de données
console.log('\n🔌 Test de connexion à la base de données...');
try {
  // Test simple de connexion
  const db = await import('./src/db.js');
  const startTime = Date.now();
  
  await db.default.query('SELECT 1 as health_check');
  const endTime = Date.now();
  
  console.log(`✅ Connexion DB réussie en ${endTime - startTime}ms`);
  
  // Test des tables critiques
  const tables = ['spectacles', 'artistes', 'lieu_images'];
  for (const table of tables) {
    try {
      const [rows] = await db.default.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`✅ Table ${table}: ${rows[0].count} enregistrements`);
    } catch (error) {
      console.error(`❌ Erreur table ${table}:`, error.message);
    }
  }
  
} catch (error) {
  console.error('❌ Erreur de connexion DB:', error.message);
  console.error('💡 Vérifiez vos paramètres de connexion DB');
}

// 3. Vérification des dépendances
console.log('\n📦 Vérification des dépendances...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['express', 'mysql2', 'cors', 'helmet'];
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length > 0) {
    console.error(`❌ Dépendances manquantes: ${missingDeps.join(', ')}`);
  } else {
    console.log('✅ Toutes les dépendances sont installées');
  }
} catch (error) {
  console.error('❌ Erreur lecture package.json:', error.message);
}

// 4. Test des routes problématiques
console.log('\n🚀 Test des routes problématiques...');

const testRoutes = async () => {
  try {
    // Démarrer le serveur en mode test
    const server = spawn('node', ['src/server.js'], {
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'test' },
      cwd: __dirname
    });
    
    // Attendre que le serveur démarre
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test des routes
    const routes = [
      '/api/rate-limit-test', // Test du rate limiting
      '/api/spectacles/all',
      '/api/spectacles/upcoming',
      '/api/artistes/featured',
      '/api/lieu/images'
    ];
    
    for (const route of routes) {
      try {
        const response = await fetch(`http://localhost:5000${route}`);
        if (response.ok) {
          console.log(`✅ ${route}: OK (${response.status})`);
        } else {
          console.error(`❌ ${route}: Erreur ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ ${route}: Erreur réseau -`, error.message);
      }
    }
    
    // Arrêter le serveur
    server.kill();
    
  } catch (error) {
    console.error('❌ Erreur test routes:', error.message);
  }
};

// 5. Vérification de la configuration
console.log('\n⚙️ Vérification de la configuration...');

// Vérifier les fichiers critiques
const criticalFiles = [
  'src/server.js',
  'src/db.js',
  'src/routes/index.js',
  'src/middleware/security.js'
];

for (const file of criticalFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}: Présent`);
  } else {
    console.error(`❌ ${file}: Manquant`);
  }
}

// 6. Test de performance
console.log('\n⚡ Test de performance...');
try {
  const db = await import('./src/db.js');
  
  // Test de requête simple
  const startTime = Date.now();
  await db.default.query('SELECT * FROM spectacles LIMIT 1');
  const endTime = Date.now();
  
  console.log(`✅ Requête simple: ${endTime - startTime}ms`);
  
  // Test de requête complexe
  const startTime2 = Date.now();
  await db.default.query('SELECT * FROM spectacles WHERE date_spectacle > NOW() ORDER BY date_spectacle LIMIT 10');
  const endTime2 = Date.now();
  
  console.log(`✅ Requête complexe: ${endTime2 - startTime2}ms`);
  
} catch (error) {
  console.error('❌ Erreur test performance:', error.message);
}

// 7. Recommandations
console.log('\n💡 Recommandations:');
console.log('1. Vérifiez les logs Render pour plus de détails');
console.log('2. Testez la connectivité DB depuis Render');
console.log('3. Vérifiez que toutes les variables d\'environnement sont définies');
console.log('4. Redémarrez le service backend après correction');

console.log('\n🔍 Diagnostic terminé !');
