const path = require('path');
const express = require('express');
// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
var firebase = require("firebase/app");

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/database");
const PORT = process.env.PORT || 3000;
// Supports ES6
//import { create, Whatsapp } from 'venom-bot';
const venom = require('venom-bot');
//const path = require('path');
//const express = require('express');

venom
  .create()
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

function start(client) {
  client.onMessage((message) => {
    if (message.body === 'Hi' && message.isGroupMsg === false) {
      client
        .sendText(message.from, 'Welcome Venom 🕷')
        .then((result) => {
          console.log('Result: ', result); //return object success
        })
        .catch((erro) => {
          console.error('Error when sending: ', erro); //return object error
        });
    }
  });
}

let app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use("/node_modules", express.static(__dirname + "/node_modules"));
app.use(express.json({ limit: '50mb' }));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode).json(err);
});
app.listen(PORT, () => { console.log(`Server listening on port ${PORT}`); });

