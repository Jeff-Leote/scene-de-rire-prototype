#!/usr/bin/env node

/**
 * 🚀 Script de Test de Performance Backend
 * Teste la latence et les connexions DB
 */

const fetch = require('node-fetch');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

console.log('🚀 Test de Performance Backend...');
console.log(`🌍 URL: ${BACKEND_URL}`);

// Test des endpoints critiques
const testEndpoints = async () => {
  const endpoints = [
    '/api/health',
    '/api/rate-limit-test',
    '/api/spectacles/all',
    '/api/spectacles/upcoming',
    '/api/artistes/featured',
    '/api/lieu/images'
  ];

  console.log('\n📊 Test des Endpoints:');
  console.log('─'.repeat(60));

  for (const endpoint of endpoints) {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`);
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        console.log(`✅ ${endpoint}: ${response.status} - ${duration}ms`);
      } else {
        console.log(`❌ ${endpoint}: ${response.status} - ${duration}ms`);
      }
      
      // Log des headers de rate limiting
      const rateLimitHeaders = {
        remaining: response.headers.get('x-ratelimit-remaining'),
        reset: response.headers.get('x-ratelimit-reset'),
        limit: response.headers.get('x-ratelimit-limit')
      };
      
      if (rateLimitHeaders.remaining) {
        console.log(`   📊 Rate Limit: ${rateLimitHeaders.remaining}/${rateLimitHeaders.limit}`);
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`💥 ${endpoint}: Erreur - ${duration}ms - ${error.message}`);
    }
  }
};

// Test de charge (multiple requêtes simultanées)
const testLoad = async () => {
  console.log('\n🔥 Test de Charge (10 requêtes simultanées):');
  console.log('─'.repeat(60));
  
  const promises = [];
  const startTime = Date.now();
  
  for (let i = 0; i < 10; i++) {
    promises.push(
      fetch(`${BACKEND_URL}/api/health`)
        .then(response => response.json())
        .then(data => ({ success: true, data }))
        .catch(error => ({ success: false, error: error.message }))
    );
  }
  
  try {
    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`📊 Résultats: ${successful} succès, ${failed} échecs`);
    console.log(`⏱️ Temps total: ${duration}ms`);
    console.log(`⚡ Temps moyen: ${duration / 10}ms par requête`);
    
    // Afficher les temps de réponse individuels
    results.forEach((result, index) => {
      if (result.success && result.data.responseTime) {
        console.log(`   Requête ${index + 1}: ${result.data.responseTime}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du test de charge:', error.message);
  }
};

// Test de la base de données
const testDatabase = async () => {
  console.log('\n🔌 Test de la Base de Données:');
  console.log('─'.repeat(60));
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    const data = await response.json();
    
    if (data.status === 'healthy') {
      console.log('✅ Base de données: Connectée');
      console.log(`⏱️ Temps de réponse: ${data.responseTime}`);
      console.log(`🌍 Environnement: ${data.environment}`);
      console.log(`⏰ Uptime: ${Math.round(data.uptime / 60)} minutes`);
      console.log(`💾 Mémoire: ${data.memory.used}MB / ${data.memory.total}MB`);
    } else {
      console.log('❌ Base de données: Problème');
      console.log(`📊 Statut: ${data.status}`);
      console.log(`⏱️ Temps de réponse: ${data.responseTime}`);
    }
    
  } catch (error) {
    console.error('💥 Erreur lors du test DB:', error.message);
  }
};

// Test de rate limiting
const testRateLimiting = async () => {
  console.log('\n🚦 Test du Rate Limiting:');
  console.log('─'.repeat(60));
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/rate-limit-test`);
    const data = await response.json();
    
    console.log('✅ Endpoint de test accessible');
    console.log(`📊 Rate Limit Info:`, data.rateLimitInfo);
    
    // Test de plusieurs requêtes pour voir l'évolution
    console.log('\n🔄 Test de plusieurs requêtes...');
    
    for (let i = 0; i < 5; i++) {
      const reqResponse = await fetch(`${BACKEND_URL}/api/rate-limit-test`);
      const remaining = reqResponse.headers.get('x-ratelimit-remaining');
      console.log(`   Requête ${i + 1}: ${remaining} restantes`);
    }
    
  } catch (error) {
    console.error('💥 Erreur lors du test rate limiting:', error.message);
  }
};

// Exécution des tests
const runTests = async () => {
  try {
    await testEndpoints();
    await testLoad();
    await testDatabase();
    await testRateLimiting();
    
    console.log('\n🎯 Tests terminés !');
    
  } catch (error) {
    console.error('💥 Erreur lors des tests:', error.message);
  }
};

// Démarrer les tests
runTests();
