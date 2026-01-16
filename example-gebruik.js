#!/usr/bin/env node
'use strict';

/**
 * PRAKTISCHE VOORBEELDEN VAN NODE-WIT
 *
 * Deze file toont verschillende manieren om de node-wit SDK te gebruiken.
 *
 * Gebruik:
 *   node example-gebruik.js <WIT_ACCESS_TOKEN>
 *
 * Om een access token te krijgen:
 *   1. Ga naar https://wit.ai
 *   2. Maak een account aan (gratis)
 *   3. Maak een nieuwe app aan
 *   4. Kopieer de Server Access Token uit Settings
 */

const {Wit, log} = require('./index');

// Controleer of er een access token is meegegeven
if (process.argv.length !== 3) {
  console.log('Gebruik: node example-gebruik.js <WIT_ACCESS_TOKEN>');
  console.log('\nOm een token te krijgen:');
  console.log('1. Ga naar https://wit.ai');
  console.log('2. Maak een gratis account');
  console.log('3. Maak een nieuwe app');
  console.log('4. Kopieer de Server Access Token\n');
  process.exit(1);
}

const accessToken = process.argv[2];

// ============================================================================
// VOORBEELD 1: Simpele Message API - Intent extractie
// ============================================================================
console.log('=== VOORBEELD 1: Simpele Message API ===\n');

const client = new Wit({
  accessToken,
  logger: new log.Logger(log.INFO)
});

// Analyseer een bericht en haal entities/intents eruit
client.message('Wat is het weer in Amsterdam?', {})
  .then((data) => {
    console.log('Wit.ai antwoord:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n');
    runExample2();
  })
  .catch((err) => {
    console.error('Fout:', err);
  });

// ============================================================================
// VOORBEELD 2: Bot met Custom Actions - Weerbericht Bot
// ============================================================================
function runExample2() {
  console.log('=== VOORBEELD 2: Weerbericht Bot met Actions ===\n');

  // Hulpfunctie om eerste entity waarde te krijgen
  const firstEntityValue = (entities, entity) => {
    const val = entities && entities[entity] &&
      Array.isArray(entities[entity]) &&
      entities[entity].length > 0 &&
      entities[entity][0].value;
    if (!val) {
      return null;
    }
    return typeof val === 'object' ? val.value : val;
  };

  // Definieer actions die je bot kan uitvoeren
  const actions = {
    // VERPLICHT: send action om berichten terug te sturen naar gebruiker
    send(request, response) {
      console.log('Bot zegt:', response.text);
      return Promise.resolve();
    },

    // Custom action: haal weerbericht op
    getWeather({context, entities}) {
      const location = firstEntityValue(entities, 'location');

      if (location) {
        // In echte app zou je hier een weather API aanroepen
        const fakeWeather = ['zonnig', 'bewolkt', 'regenachtig', 'winderig'];
        const randomWeather = fakeWeather[Math.floor(Math.random() * fakeWeather.length)];

        context.weather = `Het is ${randomWeather} in ${location}`;
        context.location = location;
        delete context.missingLocation;
      } else {
        context.missingLocation = true;
        delete context.weather;
        delete context.location;
      }

      return Promise.resolve(context);
    },

    // Custom action: haal tijd op
    getTime({context, entities}) {
      const now = new Date();
      context.time = now.toLocaleTimeString('nl-NL');
      return Promise.resolve(context);
    }
  };

  const botClient = new Wit({
    accessToken,
    actions,
    logger: new log.Logger(log.INFO)
  });

  // Simuleer een conversatie
  const sessionId = 'user-123-session';

  console.log('Gebruiker: "Wat is het weer in Rotterdam?"\n');
  botClient.runActions(sessionId, 'Wat is het weer in Rotterdam?', {})
    .then((context) => {
      console.log('\nContext na actie:', context);
      console.log('\n');
      runExample3();
    })
    .catch(console.error);
}

// ============================================================================
// VOORBEELD 3: Multi-turn conversatie
// ============================================================================
function runExample3() {
  console.log('=== VOORBEELD 3: Multi-turn Conversatie ===\n');

  const actions = {
    send(request, response) {
      console.log('🤖 Bot:', response.text);
      return Promise.resolve();
    },

    // Custom action voor bestellingen
    createOrder({context, entities}) {
      const firstEntityValue = (entities, entity) => {
        const val = entities && entities[entity] &&
          Array.isArray(entities[entity]) &&
          entities[entity].length > 0 &&
          entities[entity][0].value;
        return val && (typeof val === 'object' ? val.value : val);
      };

      const product = firstEntityValue(entities, 'product');
      const quantity = firstEntityValue(entities, 'number');

      if (product) {
        context.product = product;
      }
      if (quantity) {
        context.quantity = quantity;
      }

      if (context.product && context.quantity) {
        context.orderConfirmation = `${context.quantity}x ${context.product} besteld!`;
      }

      return Promise.resolve(context);
    }
  };

  const conversationClient = new Wit({
    accessToken,
    actions,
    logger: new log.Logger(log.WARN) // Minder verbose logging
  });

  const sessionId = 'conversation-456';
  let context = {};

  console.log('💬 Gebruiker: "Hallo"\n');

  conversationClient.runActions(sessionId, 'Hallo', context)
    .then((ctx) => {
      context = ctx;
      console.log('\n💬 Gebruiker: "Ik wil iets bestellen"\n');
      return conversationClient.runActions(sessionId, 'Ik wil iets bestellen', context);
    })
    .then((ctx) => {
      console.log('\nConversatie afgerond!');
      console.log('Finale context:', ctx);
      runExample4();
    })
    .catch(console.error);
}

// ============================================================================
// VOORBEELD 4: Praktische Use Cases
// ============================================================================
function runExample4() {
  console.log('\n=== VOORBEELD 4: Praktische Use Cases ===\n');

  console.log('📋 Mogelijke toepassingen van node-wit:\n');
  console.log('1. 🤖 Chatbots voor klantenservice');
  console.log('   - Automatisch vragen beantwoorden');
  console.log('   - Intent herkenning (bestelling, vraag, klacht)');
  console.log('   - Entity extractie (productnaam, datum, locatie)\n');

  console.log('2. 💬 Facebook Messenger bots');
  console.log('   - Geautomatiseerde responses');
  console.log('   - Bestellingen verwerken');
  console.log('   - Afspraken maken\n');

  console.log('3. 🎙️ Voice assistants');
  console.log('   - Spraak naar tekst → Wit.ai → acties');
  console.log('   - Smart home commando\'s');
  console.log('   - Informatie opvragen\n');

  console.log('4. 📊 Sentiment analyse');
  console.log('   - Klantfeedback analyseren');
  console.log('   - Social media monitoring');
  console.log('   - Review classificatie\n');

  console.log('5. 🔍 Slimme zoekopdrachten');
  console.log('   - Natuurlijke taal queries');
  console.log('   - Filters en parameters extraheren');
  console.log('   - Contextueel zoeken\n');

  console.log('\n✅ Voorbeelden voltooid!\n');
}
