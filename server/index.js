'use strict';

const express = require('express');
const morgan = require('morgan');
const path = require('path');
const  bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
const { createAuth, createPaywall } = require('./app');
const PORT = process.env.PORT || 9000;
const jsonParser = bodyParser.json();
const auth = createAuth({
  onError: (error, req, res) => {
    res.status(500).send('not ok');
  }
});

const paywall = createPaywall({
  onInactive: (req, res, next) => {
    console.log('redirecting');
    res.redirect('/subscribe');
  },
  onError: (error, req, res) => {
    res.status(500).send('not ok');
  },
})

const app = express();

// Setup logger
// app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));

// Serve static assets
app.use(express.static(path.resolve(__dirname, '..', 'build')));

// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
});

app.post('/authenticate', jsonParser, auth, async (req, res) => {
  return res.status(200).send({
    token: req.jwt,
  });
});

app.post('/download', paywall, (req, res) => {
  res.status(200).send({ url: 'https://youtu.be/TgqiSBxvdws?t=11' });
})

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
