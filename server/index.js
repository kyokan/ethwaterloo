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
  abi: [{"constant":true,"inputs":[{"name":"consumerAddress","type":"address"}],"name":"getDetailsAt","outputs":[{"name":"timestamp","type":"uint256"},{"name":"amount","type":"uint256"},{"name":"status","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"subscribersLL","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"consumerAddress","type":"address"},{"name":"paymentAmount","type":"uint256"},{"name":"interval","type":"uint256"}],"name":"requestSubscription","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"consumerAddress","type":"address"},{"name":"paymentAmount","type":"uint256"}],"name":"requestPayment","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"paymentAmount","type":"uint256"},{"name":"paymentTimestamp","type":"uint256"}],"name":"onPayment","outputs":[{"name":"success","type":"bool"}],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"},{"name":"interval","type":"uint256"},{"name":"name","type":"string"}],"name":"update","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"subscriptionName","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"payable":true,"type":"fallback"}],
  subscriptionKey: '0xB358f5Ce294C58fA556C7570c0923eC17861D005',
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
