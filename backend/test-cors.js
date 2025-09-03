#!/usr/bin/env node

/**
 * 🌍 Script de Test CORS pour la Production
 * Vérifie que la configuration CORS fonctionne correctement
 */

const fetch = require('node-fetch');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

console.log('🌍 Test de Configuration CORS...');
console.log(`🔗 Backend URL: ${BACKEND_URL}`);

// Test des origines autorisées
const testOrigins = async () => {
  const origins = [
    'https://espacecomedie.fr',
    'https://www.espacecomedie.fr',
    'https://espacecomedie.com',
    'https://www.espacecomedie.com',
    'https://scene-de-rire-prototype.onrender.com',
    'http://localhost:5173'
  ];

  console.log('\n📊 Test des Origines CORS:');
  console.log('─'.repeat(60));

  for (const origin of origins) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Origin': origin,
          'Accept': 'application/json'
        }
      });

      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
      };

      if (response.ok) {
        console.log(`✅ ${origin}: OK (${response.status})`);
        console.log(`   📋 CORS Headers:`, corsHeaders);
      } else {
        console.log(`❌ ${origin}: Erreur ${response.status}`);
      }

    } catch (error) {
      console.log(`💥 ${origin}: Erreur réseau - ${error.message}`);
    }
  }
};

// Test des requêtes OPTIONS (preflight)
const testPreflight = async () => {
  console.log('\n🚦 Test des Requêtes Preflight (OPTIONS):');
  console.log('─'.repeat(60));

  const origins = ['https://espacecomedie.fr', 'https://www.espacecomedie.fr'];

  for (const origin of origins) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/spectacles/all`, {
        method: 'OPTIONS',
        headers: {
          'Origin': origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });

      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
      };

      if (response.status === 204) {
        console.log(`✅ ${origin} - OPTIONS: OK (204)`);
        console.log(`   📋 CORS Headers:`, corsHeaders);
      } else {
        console.log(`❌ ${origin} - OPTIONS: Erreur ${response.status}`);
      }

    } catch (error) {
      console.log(`💥 ${origin} - OPTIONS: Erreur - ${error.message}`);
    }
  }
};

// Test des endpoints critiques avec CORS
const testEndpointsWithCORS = async () => {
  console.log('\n🔗 Test des Endpoints avec CORS:');
  console.log('─'.repeat(60));

  const endpoints = [
    '/api/spectacles/all',
    '/api/spectacles/upcoming',
    '/api/artistes/featured',
    '/api/lieu/images'
  ];

  const origin = 'https://espacecomedie.fr';

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Origin': origin,
          'Accept': 'application/json'
        }
      });

      const corsOrigin = response.headers.get('Access-Control-Allow-Origin');
      
      if (response.ok) {
        console.log(`✅ ${endpoint}: OK (${response.status})`);
        console.log(`   🌍 CORS Origin: ${corsOrigin}`);
      } else {
        console.log(`❌ ${endpoint}: Erreur ${response.status}`);
        console.log(`   🌍 CORS Origin: ${corsOrigin}`);
      }

    } catch (error) {
      console.log(`💥 ${endpoint}: Erreur - ${error.message}`);
    }
  }
};

// Test de la configuration CORS complète
const testCORSConfiguration = async () => {
  console.log('\n⚙️ Test de la Configuration CORS Complète:');
  console.log('─'.repeat(60));

  try {
    // Test simple sans CORS
    const simpleResponse = await fetch(`${BACKEND_URL}/api/health`);
    console.log(`✅ Requête simple: ${simpleResponse.status}`);

    // Test avec origine espacecomedie.fr
    const corsResponse = await fetch(`${BACKEND_URL}/api/health`, {
      headers: {
        'Origin': 'https://espacecomedie.fr'
      }
    });

    const corsHeaders = {
      'Access-Control-Allow-Origin': corsResponse.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Credentials': corsResponse.headers.get('Access-Control-Allow-Credentials'),
      'Access-Control-Allow-Methods': corsResponse.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': corsResponse.headers.get('Access-Control-Allow-Headers')
    };

    console.log(`✅ Requête avec CORS: ${corsResponse.status}`);
    console.log(`📋 Headers CORS:`, corsHeaders);

    // Vérifier que l'origine est autorisée
    if (corsHeaders['Access-Control-Allow-Origin'] === 'https://espacecomedie.fr') {
      console.log('✅ CORS configuré correctement pour espacecomedie.fr');
    } else {
      console.warn('⚠️ CORS pas configuré correctement pour espacecomedie.fr');
    }

  } catch (error) {
    console.error('💥 Erreur lors du test CORS:', error.message);
  }
};

// Exécution des tests
const runCORSTests = async () => {
  try {
    await testOrigins();
    await testPreflight();
    await testEndpointsWithCORS();
    await testCORSConfiguration();
    
    console.log('\n🎯 Tests CORS terminés !');
    console.log('\n💡 Si des erreurs CORS persistent:');
    console.log('1. Vérifiez que le backend est redémarré');
    console.log('2. Vérifiez les logs du serveur');
    console.log('3. Vérifiez que espacecomedie.fr est dans allowedOrigins');
    
  } catch (error) {
    console.error('💥 Erreur lors des tests CORS:', error.message);
  }
};

// Démarrer les tests
runCORSTests();
