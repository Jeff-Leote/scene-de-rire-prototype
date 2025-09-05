#!/usr/bin/env node

/**
 * 💳 Script de Test de Paiement pour la Production
 * Vérifie que les routes de paiement fonctionnent correctement
 */

const fetch = require('node-fetch');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

console.log('💳 Test des Routes de Paiement...');
console.log(`🔗 Backend URL: ${BACKEND_URL}`);

// Test des routes de réservation
const testReservationRoutes = async () => {
  const routes = [
    '/api/reservations/checkout',
    '/api/reservations',
    '/api/reservations/validate-ticket'
  ];

  console.log('\n📊 Test des Routes de Réservation:');
  console.log('─'.repeat(60));

  for (const route of routes) {
    try {
      // Test OPTIONS (preflight)
      const optionsResponse = await fetch(`${BACKEND_URL}${route}`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://espacecomedie.fr',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });

      console.log(`🚦 ${route} - OPTIONS: ${optionsResponse.status}`);

      // Test POST (sans authentification - devrait retourner 401)
      const postResponse = await fetch(`${BACKEND_URL}${route}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://espacecomedie.fr'
        },
        body: JSON.stringify({
          test: 'data'
        })
      });

      console.log(`📝 ${route} - POST (sans auth): ${postResponse.status}`);

      if (postResponse.status === 403) {
        console.log(`   ❌ Erreur CSRF détectée sur ${route}`);
      } else if (postResponse.status === 401) {
        console.log(`   ✅ Authentification requise (normal)`);
      } else {
        console.log(`   ⚠️ Statut inattendu: ${postResponse.status}`);
      }

    } catch (error) {
      console.log(`💥 ${route}: Erreur - ${error.message}`);
    }
  }
};

// Test de l'authentification
const testAuthentication = async () => {
  console.log('\n🔐 Test de l\'Authentification:');
  console.log('─'.repeat(60));

  try {
    // Test de connexion
    const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://espacecomedie.fr'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    });

    console.log(`🔑 Login test: ${loginResponse.status}`);

    if (loginResponse.status === 401) {
      console.log('✅ Authentification fonctionne (401 attendu pour test@example.com)');
    } else {
      console.log(`⚠️ Statut inattendu pour login: ${loginResponse.status}`);
    }

  } catch (error) {
    console.log(`💥 Erreur test auth: ${error.message}`);
  }
};

// Test des headers CORS pour les paiements
const testCORSPayment = async () => {
  console.log('\n🌍 Test CORS pour les Paiements:');
  console.log('─'.repeat(60));

  const origins = ['https://espacecomedie.fr', 'https://www.espacecomedie.fr'];

  for (const origin of origins) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/reservations/checkout`, {
        method: 'OPTIONS',
        headers: {
          'Origin': origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization, X-CSRF-Token'
        }
      });

      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
      };

      console.log(`✅ ${origin} - OPTIONS: ${response.status}`);
      console.log(`   📋 CORS Headers:`, corsHeaders);

    } catch (error) {
      console.log(`💥 ${origin}: Erreur - ${error.message}`);
    }
  }
};

// Test de la configuration Stripe
const testStripeConfig = async () => {
  console.log('\n💳 Test de la Configuration Stripe:');
  console.log('─'.repeat(60));

  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    const data = await response.json();

    console.log(`✅ Health check: ${response.status}`);
    console.log(`🌍 Environnement: ${data.environment || 'N/A'}`);

    // Vérifier les variables d'environnement
    console.log('\n📋 Variables d\'environnement:');
    console.log(`🔑 STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? 'DÉFINIE' : 'NON DÉFINIE'}`);
    console.log(`🌐 FRONTEND_URL: ${process.env.FRONTEND_URL || 'NON DÉFINIE'}`);

  } catch (error) {
    console.log(`💥 Erreur test Stripe: ${error.message}`);
  }
};

// Exécution des tests
const runPaymentTests = async () => {
  try {
    await testReservationRoutes();
    await testAuthentication();
    await testCORSPayment();
    await testStripeConfig();
    
    console.log('\n🎯 Tests de paiement terminés !');
    console.log('\n💡 Si des erreurs 403 persistent:');
    console.log('1. Vérifiez que les routes /api/reservations/* sont exemptées CSRF');
    console.log('2. Vérifiez que le backend est redémarré');
    console.log('3. Vérifiez les logs du serveur pour les exemptions CSRF');
    
  } catch (error) {
    console.error('💥 Erreur lors des tests de paiement:', error.message);
  }
};

// Démarrer les tests
runPaymentTests();

