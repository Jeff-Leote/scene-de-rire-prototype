#!/usr/bin/env node

/**
 * 🚀 Script de Démarrage Optimisé pour la Production
 * Démarre le serveur backend avec toutes les optimisations de performance
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Démarrage du serveur backend optimisé pour la production...');

// 1. Vérification de l'environnement
console.log('🔍 Vérification de l\'environnement...');
const env = process.env.NODE_ENV || 'development';
console.log(`🌍 Environnement: ${env}`);

if (env === 'production') {
  console.log('✅ Mode production détecté - Optimisations activées');
  
  // Vérifier les variables d'environnement critiques
  const criticalEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
  const missingVars = criticalEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`❌ Variables d'environnement manquantes: ${missingVars.join(', ')}`);
    console.error('💡 Assurez-vous que toutes les variables sont définies');
    process.exit(1);
  }
  
  console.log('✅ Toutes les variables d\'environnement sont définies');
} else {
  console.log('⚠️ Mode développement - Certaines optimisations sont désactivées');
}

// 2. Vérification des dépendances
console.log('📦 Vérification des dépendances...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['express', 'mysql2', 'cors', 'helmet'];
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length > 0) {
    console.error(`❌ Dépendances manquantes: ${missingDeps.join(', ')}`);
    console.error('💡 Exécutez: npm install');
    process.exit(1);
  }
  
  console.log('✅ Toutes les dépendances sont installées');
} catch (error) {
  console.error('❌ Erreur lors de la lecture du package.json:', error.message);
  process.exit(1);
}

// 3. Vérification et préchauffage de la base de données
console.log('🔌 Test de connexion à la base de données...');
try {
  // Test simple de connexion
  const db = await import('./src/db.js');
  await db.default.query('SELECT 1 as health_check');
  console.log('✅ Connexion à la base de données réussie');
  
  // Préchauffage de la base de données en production
  if (env === 'production') {
    console.log('🔥 Préchauffage de la base de données...');
    try {
      const { spawn } = await import('child_process');
      const warmup = spawn('node', ['db-warmup.js'], {
        stdio: 'inherit',
        env: envVars,
        cwd: __dirname
      });
      
      warmup.on('exit', (code) => {
        if (code === 0) {
          console.log('✅ Préchauffage de la base de données terminé');
        } else {
          console.warn('⚠️ Préchauffage de la base de données échoué, mais le serveur continuera');
        }
      });
    } catch (warmupError) {
      console.warn('⚠️ Erreur lors du préchauffage:', warmupError.message);
    }
  }
} catch (error) {
  console.error('❌ Erreur de connexion à la base de données:', error.message);
  console.error('💡 Vérifiez vos paramètres de connexion DB');
  process.exit(1);
}

// 4. Démarrage du serveur avec optimisations
console.log('🚀 Démarrage du serveur avec optimisations...');

// Variables d'environnement pour les optimisations
const envVars = {
  ...process.env,
  NODE_ENV: env,
  // Optimisations Node.js pour la production
  NODE_OPTIONS: env === 'production' ? '--max-old-space-size=512 --optimize-for-size' : '',
  // Optimisations pour les performances
  UV_THREADPOOL_SIZE: '4', // Limiter les threads pour éviter la surcharge
};

// Démarrer le serveur principal
const server = spawn('node', ['src/server.js'], {
  stdio: 'inherit',
  env: envVars,
  cwd: __dirname
});

// Gestion des événements du serveur
server.on('error', (error) => {
  console.error('❌ Erreur lors du démarrage du serveur:', error.message);
  process.exit(1);
});

server.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Serveur arrêté avec le code: ${code}`);
    process.exit(code);
  }
});

// 5. Démarrage du script de keep-alive agressif en production
if (env === 'production') {
  console.log('🔄 Démarrage du script de keep-alive agressif...');
  
  const keepAlive = spawn('node', ['keep-alive-aggressive.js'], {
    stdio: 'inherit',
    env: envVars,
    cwd: __dirname
  });
  
  keepAlive.on('error', (error) => {
    console.warn('⚠️ Erreur lors du démarrage du keep-alive agressif:', error.message);
    console.warn('💡 Le serveur principal continuera de fonctionner');
  });
  
  // Arrêter le keep-alive si le serveur principal s'arrête
  server.on('exit', () => {
    keepAlive.kill();
  });
}

// 6. Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur...');
  server.kill('SIGTERM');
  process.exit(0);
});

// 7. Monitoring des performances
if (env === 'production') {
  console.log('📊 Monitoring des performances activé');
  
  // Surveillance de la mémoire
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024)
    };
    
    console.log(`📊 Mémoire: RSS=${memUsageMB.rss}MB, Heap=${memUsageMB.heapUsed}MB/${memUsageMB.heapTotal}MB`);
    
    // Alerte si utilisation mémoire élevée
    if (memUsageMB.heapUsed > 400) { // 400MB
      console.warn('⚠️ Utilisation mémoire élevée détectée');
    }
  }, 5 * 60 * 1000); // Toutes les 5 minutes
}

console.log('✅ Serveur backend démarré avec succès !');
console.log('🚀 Optimisations de performance activées');
console.log('📊 Monitoring en cours...');
console.log('💡 Utilisez Ctrl+C pour arrêter le serveur');
