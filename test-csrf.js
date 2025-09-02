// 🧪 Script de test pour la protection CSRF
// Teste que les tokens CSRF sont correctement gérés

const https = require('https');
const http = require('http');

const BASE_URL = process.env.BACKEND_URL || 'https://scene-de-rire-prototype.onrender.com';

console.log('🧪 Test de la protection CSRF');
console.log('📍 URL de test:', BASE_URL);

// Fonction pour faire une requête HTTP/HTTPS
const makeRequest = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
};

// Tests à effectuer
const tests = [
  {
    name: 'Route publique (GET /api/spectacles) - Devrait passer sans CSRF',
    url: `${BASE_URL}/api/spectacles`,
    method: 'GET',
    expectStatus: 200
  },
  {
    name: 'Route publique (GET /api/artistes) - Devrait passer sans CSRF',
    url: `${BASE_URL}/api/artistes`,
    method: 'GET',
    expectStatus: 200
  },
  {
    name: 'Route protégée (POST /api/contact) - Devrait échouer sans CSRF',
    url: `${BASE_URL}/api/contact`,
    method: 'POST',
    body: JSON.stringify({ name: 'Test', email: 'test@test.com', message: 'Test' }),
    expectStatus: 403
  },
  {
    name: 'Route protégée avec CSRF valide - Devrait passer',
    url: `${BASE_URL}/api/contact`,
    method: 'POST',
    headers: { 'X-CSRF-Token': 'test-token-123456789' },
    body: JSON.stringify({ name: 'Test', email: 'test@test.com', message: 'Test' }),
    expectStatus: 200 // ou 400 si validation des données échoue, mais pas 403
  }
];

// Exécuter les tests
const runTests = async () => {
  console.log('\n🚀 Démarrage des tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`📋 Test: ${test.name}`);
      
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          ...test.headers
        }
      };
      
      if (test.body) {
        options.body = test.body;
      }
      
      const result = await makeRequest(test.url, options);
      
      if (result.status === test.expectStatus) {
        console.log(`✅ PASS - Status: ${result.status}`);
        passed++;
      } else {
        console.log(`❌ FAIL - Attendu: ${test.expectStatus}, Reçu: ${result.status}`);
        console.log(`   Réponse:`, result.data);
        failed++;
      }
      
    } catch (error) {
      console.log(`❌ ERROR - ${error.message}`);
      failed++;
    }
    
    console.log(''); // Ligne vide pour la lisibilité
  }
  
  // Résumé des tests
  console.log('📊 Résumé des tests:');
  console.log(`✅ Tests réussis: ${passed}`);
  console.log(`❌ Tests échoués: ${failed}`);
  console.log(`📈 Taux de réussite: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 Tous les tests sont passés ! La protection CSRF fonctionne correctement.');
  } else {
    console.log('\n⚠️ Certains tests ont échoué. Vérifiez la configuration CSRF.');
  }
};

// Démarrer les tests
runTests().catch(console.error);
