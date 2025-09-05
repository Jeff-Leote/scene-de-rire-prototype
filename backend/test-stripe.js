#!/usr/bin/env node

/**
 * 💳 Script de Test Stripe pour la Production
 * Vérifie que la configuration Stripe fonctionne correctement
 */

require('dotenv').config();

console.log('💳 Test de Configuration Stripe...');
console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);

// 1. Vérification des variables d'environnement
console.log('\n📋 Vérification des Variables d\'Environnement:');
console.log('─'.repeat(60));

const requiredVars = ['STRIPE_SECRET_KEY', 'FRONTEND_URL'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`❌ Variables manquantes: ${missingVars.join(', ')}`);
} else {
  console.log('✅ Toutes les variables requises sont définies');
}

// Afficher les valeurs (masquées pour la sécurité)
console.log(`🔑 STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? '***' + process.env.STRIPE_SECRET_KEY.slice(-4) : 'NON DÉFINIE'}`);
console.log(`🌐 FRONTEND_URL: ${process.env.FRONTEND_URL || 'NON DÉFINIE'}`);

// 2. Test de l'initialisation Stripe
console.log('\n🔧 Test d\'Initialisation Stripe:');
console.log('─'.repeat(60));

let stripe;
try {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY non définie');
  }
  
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  console.log('✅ Stripe initialisé avec succès');
  
  // Vérifier le type de clé
  if (process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
    console.log('🧪 Mode TEST détecté');
  } else if (process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
    console.log('🚀 Mode PRODUCTION détecté');
  } else {
    console.warn('⚠️ Format de clé Stripe non reconnu');
  }
  
} catch (error) {
  console.error('❌ Erreur d\'initialisation Stripe:', error.message);
  
  // Fallback pour le développement
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Tentative avec clé de test par défaut...');
    try {
      stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');
      console.log('✅ Stripe initialisé avec clé de test par défaut');
    } catch (fallbackError) {
      console.error('❌ Échec du fallback:', fallbackError.message);
    }
  }
}

// 3. Test de création d'une session de test
if (stripe) {
  console.log('\n🧪 Test de Création de Session Stripe:');
  console.log('─'.repeat(60));
  
  try {
    const testSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Test de Configuration Stripe',
          },
          unit_amount: 100, // 1€
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?payment=cancel`,
      metadata: {
        test: 'true',
        timestamp: new Date().toISOString()
      }
    });
    
    console.log('✅ Session Stripe créée avec succès');
    console.log(`🔗 URL de test: ${testSession.url}`);
    console.log(`🆔 Session ID: ${testSession.id}`);
    
    // Annuler la session de test
    await stripe.checkout.sessions.expire(testSession.id);
    console.log('✅ Session de test annulée');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de session:', error.message);
    
    if (error.type === 'StripeInvalidRequestError') {
      console.error('💡 Vérifiez que votre clé Stripe est valide');
    } else if (error.type === 'StripeAuthenticationError') {
      console.error('💡 Vérifiez que votre clé Stripe est correcte');
    }
  }
}

// 4. Test de l'URL du frontend
console.log('\n🌐 Test de l\'URL du Frontend:');
console.log('─'.repeat(60));

const frontendUrl = process.env.NODE_ENV === 'production' 
  ? 'https://espacecomedie.fr'
  : process.env.FRONTEND_URL || 'http://localhost:5173';

console.log(`🌐 URL configurée: ${frontendUrl}`);

// Test de connectivité (si possible)
if (frontendUrl.startsWith('http')) {
  try {
    const fetch = require('node-fetch');
    const response = await fetch(frontendUrl, { method: 'HEAD', timeout: 5000 });
    console.log(`✅ Frontend accessible: ${response.status}`);
  } catch (error) {
    console.warn(`⚠️ Frontend non accessible: ${error.message}`);
  }
}

// 5. Recommandations
console.log('\n💡 Recommandations:');
console.log('─'.repeat(60));

if (process.env.NODE_ENV === 'production') {
  console.log('🚀 Pour la PRODUCTION:');
  console.log('1. Vérifiez que STRIPE_SECRET_KEY contient une clé sk_live_');
  console.log('2. Vérifiez que FRONTEND_URL pointe vers https://espacecomedie.fr');
  console.log('3. Testez un paiement réel avec une petite somme');
} else {
  console.log('🧪 Pour le DÉVELOPPEMENT:');
  console.log('1. Utilisez une clé sk_test_ pour Stripe');
  console.log('2. FRONTEND_URL doit pointer vers http://localhost:5173');
  console.log('3. Testez avec les cartes de test Stripe');
}

console.log('\n🎯 Test Stripe terminé !');

