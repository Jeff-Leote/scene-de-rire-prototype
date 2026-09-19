#!/usr/bin/env node

/**
 * 🚀 Script de Ping Externe pour Render (web/)
 * Maintient le service Render du nouveau site (Next.js) actif en le pingant depuis l'extérieur
 * À exécuter sur un serveur externe ou en local
 */

const https = require('https');
const http = require('http');

// Configuration
const SITES = ['https://espace-comedie.onrender.com'];

const PING_INTERVAL = 8 * 60 * 1000; // 8 minutes (avant les 15 min de veille du plan gratuit Render)

console.log('🚀 Démarrage du ping externe Render...');
console.log(`⏰ Intervalle: ${PING_INTERVAL / 1000} secondes`);
console.log(`🌐 Sites à pinger: ${SITES.join(', ')}`);

const pingSite = (url) => {
  const startTime = Date.now();

  const protocol = url.startsWith('https') ? https : http;

  protocol
    .get(url, (res) => {
      const duration = Date.now() - startTime;
      console.log(`✅ ${url} - ${res.statusCode} - ${duration}ms - ${new Date().toISOString()}`);
    })
    .on('error', (err) => {
      console.error(`❌ ${url} - Erreur: ${err.message} - ${new Date().toISOString()}`);
    });
};

// Ping initial
console.log('🔄 Ping initial...');
SITES.forEach(pingSite);

// Ping périodique
setInterval(() => {
  console.log('🔄 Ping périodique...');
  SITES.forEach(pingSite);
}, PING_INTERVAL);

console.log('🔄 Ping automatique activé - Service Render maintenu actif');
