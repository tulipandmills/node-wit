#!/usr/bin/env node
'use strict';

/**
 * DEMO: Hoe node-wit werkt (zonder echte Wit.ai token)
 *
 * Dit voorbeeld toont de structuur en flow van een Wit.ai bot,
 * zonder dat je een Wit.ai account nodig hebt.
 */

const {Wit, log} = require('./index');

console.log('=== NODE-WIT DEMO: Hoe het werkt ===\n');

// ============================================================================
// STAP 1: Begrijp de basisstructuur
// ============================================================================
console.log('📚 STAP 1: Basisstructuur\n');

// Een Wit bot bestaat uit:
const botStructuur = {
  accessToken: 'JE_WIT_AI_TOKEN',  // Van https://wit.ai
  actions: {
    // VERPLICHT: send() - stuurt berichten naar gebruiker
    send(request, response) {
      console.log('Bot zegt:', response.text);
      return Promise.resolve();
    },

    // Custom actions - jouw eigen logica
    customAction(request) {
      const {sessionId, context, text, entities} = request;
      // Doe iets met de data
      // Return een (aangepaste) context
      return Promise.resolve(context);
    }
  },
  logger: new log.Logger(log.INFO) // Optioneel: logging
};

console.log('Bot structuur:');
console.log(JSON.stringify({
  accessToken: 'JE_WIT_AI_TOKEN',
  actions: ['send', 'customAction1', 'customAction2'],
  logger: 'Logger instance'
}, null, 2));

console.log('\n---\n');

// ============================================================================
// STAP 2: Simuleer een conversatie flow
// ============================================================================
console.log('💬 STAP 2: Conversatie Flow Simulatie\n');

// Simuleer wat Wit.ai zou doen
function simulateWitResponse(userMessage) {
  console.log(`👤 Gebruiker: "${userMessage}"`);

  // In echte situatie analyseert Wit.ai het bericht
  // en stuurt terug: type (msg/action/stop), entities, etc.

  if (userMessage.toLowerCase().includes('weer')) {
    return {
      type: 'action',
      action: 'getWeather',
      entities: {
        location: [{value: 'Amsterdam'}]
      }
    };
  } else if (userMessage.toLowerCase().includes('tijd')) {
    return {
      type: 'action',
      action: 'getTime',
      entities: {}
    };
  } else {
    return {
      type: 'msg',
      msg: 'Sorry, ik begrijp je niet helemaal. Kun je dat anders formuleren?'
    };
  }
}

// Definieer je actions
const myActions = {
  send(request, response) {
    console.log(`🤖 Bot: "${response.text}"`);
    return Promise.resolve();
  },

  getWeather({context, entities}) {
    const location = entities.location ? entities.location[0].value : 'onbekende locatie';
    context.weather = `Het is zonnig in ${location}`;
    console.log(`   [Action uitgevoerd: getWeather]`);
    console.log(`   [Context updated: weather = "${context.weather}"]`);
    return Promise.resolve(context);
  },

  getTime({context}) {
    context.time = new Date().toLocaleTimeString('nl-NL');
    console.log(`   [Action uitgevoerd: getTime]`);
    console.log(`   [Context updated: time = "${context.time}"]`);
    return Promise.resolve(context);
  }
};

// Simuleer conversatie
const messages = [
  'Hoe is het weer?',
  'Hoe laat is het?',
  'Vertel een grap'
];

let context = {};

messages.forEach((msg, i) => {
  console.log(`\n--- Bericht ${i + 1} ---`);
  const witResponse = simulateWitResponse(msg);

  console.log(`📥 Wit.ai response type: "${witResponse.type}"`);

  if (witResponse.type === 'action') {
    console.log(`   → Voer action uit: ${witResponse.action}`);
    const actionFn = myActions[witResponse.action];
    if (actionFn) {
      context = actionFn({context, entities: witResponse.entities});
    }
  } else if (witResponse.type === 'msg') {
    console.log(`   → Stuur bericht naar gebruiker`);
    myActions.send({}, {text: witResponse.msg});
  }

  console.log(`📊 Huidige context:`, JSON.stringify(context, null, 2));
});

console.log('\n---\n');

// ============================================================================
// STAP 3: Praktisch voorbeeld - Bestelling Bot
// ============================================================================
console.log('🛍️  STAP 3: Praktisch Voorbeeld - Bestelling Bot\n');

// Stel je voor: een pizza bestelling bot
const pizzaBot = {
  context: {},

  processMessage(userMessage) {
    console.log(`👤 "${userMessage}"`);

    // Simuleer Wit.ai NLP
    let intent = null;
    let entities = {};

    if (userMessage.toLowerCase().includes('pizza')) {
      intent = 'order';
      entities.product = 'pizza';
    }
    if (userMessage.match(/\d+/)) {
      entities.quantity = parseInt(userMessage.match(/\d+/)[0]);
    }

    // Voer action uit gebaseerd op intent
    if (intent === 'order') {
      if (entities.product) this.context.product = entities.product;
      if (entities.quantity) this.context.quantity = entities.quantity;

      if (this.context.product && this.context.quantity) {
        console.log(`🤖 "Ik heb ${this.context.quantity} ${this.context.product}(s) voor je besteld!"`);
        this.context = {}; // Reset na bestelling
      } else if (this.context.product && !this.context.quantity) {
        console.log(`🤖 "Hoeveel ${this.context.product}s wil je bestellen?"`);
      } else if (!this.context.product) {
        console.log(`🤖 "Wat wil je bestellen?"`);
      }
    } else {
      console.log(`🤖 "Wat kan ik voor je doen? Je kunt een pizza bestellen!"`);
    }

    console.log(`   Context:`, this.context);
  }
};

// Simuleer conversatie
console.log('Conversatie:');
pizzaBot.processMessage('Hallo');
console.log();
pizzaBot.processMessage('Ik wil een pizza');
console.log();
pizzaBot.processMessage('2 stuks graag');
console.log();

// ============================================================================
// STAP 4: Hoe te starten
// ============================================================================
console.log('\n📖 STAP 4: Hoe te beginnen met Wit.ai\n');

const steps = [
  '1. Maak gratis account op https://wit.ai',
  '2. Maak nieuwe app in Wit.ai console',
  '3. Train je bot met voorbeelden:',
  '   - "Ik wil een pizza bestellen" → intent: order, entity: product=pizza',
  '   - "Wat is het weer in Amsterdam?" → intent: weather, entity: location=Amsterdam',
  '4. Kopieer de Server Access Token',
  '5. Gebruik de token in je Node.js app:',
  '',
  '   const client = new Wit({',
  '     accessToken: "JE_TOKEN_HIER",',
  '     actions: { send, customAction }',
  '   });',
  '',
  '6. Test met: client.message("text") of client.runActions()',
];

steps.forEach(step => console.log(step));

console.log('\n✅ Demo voltooid!\n');
console.log('💡 TIP: Bekijk de examples/ folder voor meer voorbeelden');
console.log('📚 Docs: https://wit.ai/docs\n');
