#!/usr/bin/env node

/**
 * 🧪 Script de Test des Logs Railway
 * Teste que les console.log fonctionnent en production
 */

console.log('🧪 TEST DES LOGS RAILWAY DÉMARRÉ');
console.log('⏰ Timestamp:', new Date().toISOString());
console.log('🌍 Environnement:', process.env.NODE_ENV || 'development');
console.log('📊 Mémoire:', Math.round(process.memoryUsage().heapUsed / 1024 / 1024), 'MB');

// Test de ping
setInterval(() => {
  console.log('🔄 TEST PING -', new Date().toISOString());
}, 10000); // Toutes les 10 secondes

console.log('✅ TEST DES LOGS ACTIVÉ - Ping toutes les 10 secondes');
