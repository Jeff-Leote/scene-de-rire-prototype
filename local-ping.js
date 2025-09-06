#!/usr/bin/env node

/**
 * 🏠 Script de Ping Local pour Railway
 * À exécuter sur votre machine locale pour maintenir Railway actif
 */

const https = require('https');

const SITE_URL = 'https://scene-de-rire-prototype.onrender.com';
const PING_INTERVAL = 90 * 1000; // 90 secondes (plus agressif que Railway)

console.log('🏠 Ping local Railway démarré...');
console.log(`🌐 Site: ${SITE_URL}`);
console.log(`⏰ Intervalle: ${PING_INTERVAL / 1000} secondes`);

const pingRailway = () => {
  const startTime = Date.now();
  
  https.get(`${SITE_URL}/api/health`, (res) => {
    const duration = Date.now() - startTime;
    console.log(`✅ Railway ping - ${res.statusCode} - ${duration}ms - ${new Date().toISOString()}`);
  }).on('error', (err) => {
    console.error(`❌ Railway ping échoué - ${err.message} - ${new Date().toISOString()}`);
  });
};

// Ping initial
console.log('🔄 Ping initial...');
pingRailway();

// Ping périodique
setInterval(pingRailway, PING_INTERVAL);

console.log('🔄 Ping automatique local activé - Railway maintenu actif');
