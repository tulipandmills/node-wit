# Node-Wit Toepassingsvoorbeelden

## Wat is dit?

**node-wit** is de officiële Node.js SDK voor [Wit.ai](https://wit.ai) - een Natural Language Processing (NLP) platform voor het bouwen van chatbots en voice assistants.

## Quick Start

### 1. Zonder Wit.ai Account (Demo)
```bash
# Begrijp eerst hoe het werkt zonder token
node demo-zonder-token.js
```

### 2. Met Wit.ai Account
```bash
# Krijg eerst een token van https://wit.ai
node example-gebruik.js <JE_WIT_AI_TOKEN>
```

---

## 📚 Praktische Toepassingen

### 1. 🤖 Klantenservice Chatbot

**Use case**: Automatisch klantvragen beantwoorden

```javascript
const {Wit} = require('node-wit');

const client = new Wit({
  accessToken: 'JE_TOKEN',
  actions: {
    send(request, response) {
      // Stuur antwoord naar klant
      console.log('Bot:', response.text);
      return Promise.resolve();
    },

    checkOrderStatus({context, entities}) {
      const orderNumber = entities.order_number?.[0]?.value;

      // Zoek bestelling in database
      const status = zoekBestelling(orderNumber);
      context.orderStatus = status;

      return Promise.resolve(context);
    }
  }
});

// Gebruiker vraagt: "Wat is de status van order 12345?"
// Wit.ai extraheert: intent=check_order, order_number=12345
// Bot voert checkOrderStatus action uit
// Bot antwoordt met de status
```

### 2. 💬 Facebook Messenger Bot

**Use case**: Automatische responses op Facebook

```javascript
const {Wit} = require('node-wit');
const express = require('express');

const app = express();
const wit = new Wit({
  accessToken: 'JE_TOKEN',
  actions: {
    send(request, response) {
      // Stuur via Facebook Messenger API
      sendFacebookMessage(request.sessionId, response.text);
      return Promise.resolve();
    }
  }
});

app.post('/webhook', (req, res) => {
  const message = req.body.message;
  const senderId = req.body.sender.id;

  // Verwerk bericht via Wit.ai
  wit.runActions(senderId, message, {})
    .then(() => res.sendStatus(200))
    .catch(err => res.sendStatus(500));
});
```

### 3. 🛍️ E-commerce Bestelling Bot

**Use case**: Producten bestellen via chat

```javascript
const actions = {
  send(request, response) {
    sendToUser(response.text);
    return Promise.resolve();
  },

  addToCart({context, entities}) {
    const product = entities.product?.[0]?.value;
    const quantity = entities.number?.[0]?.value || 1;

    if (product) {
      context.cart = context.cart || [];
      context.cart.push({product, quantity});
      context.message = `${quantity}x ${product} toegevoegd aan winkelwagen`;
    }

    return Promise.resolve(context);
  },

  checkout({context}) {
    // Verwerk bestelling
    const total = berekenTotaal(context.cart);
    context.orderConfirmation = `Bestelling geplaatst! Totaal: €${total}`;
    context.cart = [];

    return Promise.resolve(context);
  }
};
```

**Conversatie voorbeeld:**
```
Gebruiker: "Ik wil 2 pizza's bestellen"
Bot: "2x pizza toegevoegd aan winkelwagen"

Gebruiker: "En 1 cola"
Bot: "1x cola toegevoegd aan winkelwagen"

Gebruiker: "Ik wil afrekenen"
Bot: "Bestelling geplaatst! Totaal: €23,50"
```

### 4. 🌤️ Weer & Informatie Bot

**Use case**: Informatie opvragen in natuurlijke taal

```javascript
const actions = {
  send(request, response) {
    console.log('Bot:', response.text);
    return Promise.resolve();
  },

  getWeather({context, entities}) {
    const location = entities.location?.[0]?.value;

    if (location) {
      // Roep weather API aan
      const weather = fetchWeatherAPI(location);
      context.forecast = `${weather.temp}°C en ${weather.condition} in ${location}`;
    }

    return Promise.resolve(context);
  },

  getTime({context, entities}) {
    const timezone = entities.timezone?.[0]?.value || 'Europe/Amsterdam';
    context.time = new Date().toLocaleTimeString('nl-NL', {timeZone: timezone});
    return Promise.resolve(context);
  }
};
```

### 5. 📅 Afspraken Maken

**Use case**: Automatisch afspraken plannen

```javascript
const actions = {
  send(request, response) {
    return Promise.resolve();
  },

  scheduleAppointment({context, entities}) {
    const datetime = entities.datetime?.[0]?.value;
    const service = entities.service?.[0]?.value;

    if (datetime && service) {
      // Voeg toe aan agenda
      const appointment = createAppointment(datetime, service);
      context.confirmation = `Afspraak gepland voor ${service} op ${datetime}`;
    } else if (!datetime) {
      context.missingDatetime = true;
    }

    return Promise.resolve(context);
  }
};
```

**Conversatie voorbeeld:**
```
Gebruiker: "Ik wil graag een afspraak maken voor de kapper"
Bot: "Wanneer wil je komen?"

Gebruiker: "Volgende week dinsdag om 14:00"
Bot: "Afspraak gepland voor kapper op dinsdag 23 januari om 14:00"
```

---

## 🔧 Basis Template

```javascript
const {Wit, log} = require('node-wit');

// Helper functie
const firstEntityValue = (entities, entity) => {
  const val = entities?.[entity]?.[0]?.value;
  return typeof val === 'object' ? val.value : val;
};

// Definieer je actions
const actions = {
  // VERPLICHT: send action
  send(request, response) {
    const {sessionId, context} = request;
    const {text, quickreplies} = response;

    // Stuur bericht naar gebruiker
    console.log('Bot zegt:', text);

    return Promise.resolve();
  },

  // Custom action 1
  myAction1({sessionId, context, text, entities}) {
    // Jouw logica hier
    const value = firstEntityValue(entities, 'my_entity');

    if (value) {
      context.result = `Verwerkt: ${value}`;
    }

    return Promise.resolve(context);
  },

  // Custom action 2
  myAction2({context, entities}) {
    // Nog meer logica
    return Promise.resolve(context);
  }
};

// Maak Wit client
const client = new Wit({
  accessToken: process.env.WIT_TOKEN,
  actions,
  logger: new log.Logger(log.INFO)
});

// Gebruik: Message API (simpel)
client.message('Hoe is het weer?', {})
  .then(data => console.log(data))
  .catch(console.error);

// Of: RunActions (conversatie)
const sessionId = 'user-123';
client.runActions(sessionId, 'Hoe is het weer?', {})
  .then(context => console.log('Context:', context))
  .catch(console.error);
```

---

## 📊 API Overzicht

### `message()` - Simpele analyse
```javascript
client.message('tekst om te analyseren', {context})
  .then(data => {
    // data bevat: entities, intents, etc.
  });
```

### `runActions()` - Volledige conversatie
```javascript
client.runActions(sessionId, 'gebruiker bericht', context, maxSteps)
  .then(newContext => {
    // newContext bevat updated session state
  });
```

### `converse()` - Low-level API
```javascript
client.converse(sessionId, 'bericht', context, reset)
  .then(data => {
    // data bevat: type (msg/action/stop), entities, etc.
  });
```

---

## 🚀 Volledige Setup Stappen

### 1. Installeer package
```bash
npm install node-wit
```

### 2. Maak Wit.ai app
1. Ga naar https://wit.ai
2. Maak gratis account
3. Klik "New App"
4. Geef app een naam

### 3. Train je bot
1. Ga naar "Understanding" tab
2. Voeg voorbeeldzinnen toe:
   - "Ik wil een pizza bestellen" → intent: `order`, entity: `product=pizza`
   - "Wat kost een pizza?" → intent: `price`, entity: `product=pizza`
3. Train met minimaal 10-20 voorbeelden per intent

### 4. Maak actions in Wit.ai
1. Ga naar "Management" > "Actions"
2. Maak custom actions (bijv. `getPrice`, `createOrder`)

### 5. Haal token op
1. Ga naar "Settings"
2. Kopieer "Server Access Token"

### 6. Gebruik in code
```javascript
const {Wit} = require('node-wit');

const client = new Wit({
  accessToken: 'JE_TOKEN_HIER',
  actions: {
    send(request, response) {
      console.log(response.text);
      return Promise.resolve();
    },

    getPrice({context, entities}) {
      const product = entities.product?.[0]?.value;
      context.price = prijzenDB[product];
      return Promise.resolve(context);
    }
  }
});
```

---

## 💡 Tips & Best Practices

### 1. Entity Extractie
```javascript
// Veilige manier om entities op te halen
const firstEntityValue = (entities, entity) => {
  const val = entities?.[entity]?.[0]?.value;
  if (!val) return null;
  return typeof val === 'object' ? val.value : val;
};

// Gebruik:
const location = firstEntityValue(entities, 'location');
```

### 2. Context Management
```javascript
// Context gebruiken voor session state
const context = {
  userName: 'Jan',
  cart: [],
  step: 'selecting_product'
};

// Update context in actions
myAction({context, entities}) {
  context.step = 'checkout';
  return Promise.resolve(context);
}
```

### 3. Error Handling
```javascript
client.runActions(sessionId, message, context)
  .then(newContext => {
    // Success
  })
  .catch(err => {
    console.error('Wit.ai error:', err);
    // Fallback response
    sendToUser('Sorry, er ging iets mis. Probeer het opnieuw.');
  });
```

### 4. Logging
```javascript
const {log} = require('node-wit');

// DEBUG: Alles loggen (development)
const logger = new log.Logger(log.DEBUG);

// INFO: Normale logging (production)
const logger = new log.Logger(log.INFO);

// WARN: Alleen warnings en errors
const logger = new log.Logger(log.WARN);
```

---

## 📁 Bestanden in deze repo

- `demo-zonder-token.js` - Demo zonder Wit.ai account nodig
- `example-gebruik.js` - Praktische voorbeelden met echte Wit.ai
- `examples/basic.js` - Simpel interactief voorbeeld
- `examples/quickstart.js` - Weerbericht bot voorbeeld
- `examples/messenger.js` - Facebook Messenger integratie

---

## 📚 Meer Informatie

- **Documentatie**: https://wit.ai/docs
- **API Reference**: https://wit.ai/docs/http
- **GitHub**: https://github.com/wit-ai/node-wit
- **Community**: https://github.com/wit-ai/node-wit/issues

---

## ❓ Veelgestelde Vragen

**Q: Is Wit.ai gratis?**
A: Ja, Wit.ai is gratis te gebruiken.

**Q: Welke talen worden ondersteund?**
A: 100+ talen, waaronder Nederlands!

**Q: Kan ik het lokaal draaien?**
A: Nee, Wit.ai is een cloud service. Je maakt API calls naar hun servers.

**Q: Hoe zit het met privacy?**
A: Wit.ai is eigendom van Meta. Lees hun privacy policy op wit.ai.

**Q: Alternatieven?**
A: Dialogflow (Google), LUIS (Microsoft), Rasa (open source, self-hosted).

---

✅ **Veel succes met het bouwen van je bot!**
