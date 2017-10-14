const express = require('express');
const morgan = require('morgan');
const path = require('path');
var bodyParser = require('body-parser')

const jwt = require('jsonwebtoken');
const ethUtil = require('ethereumjs-util');

const RedisSessions = require('redis-sessions');
const REDIS_URL='redis://127.0.0.1:6379';

let redisClient = new RedisSessions({
  options: {
    url: REDIS_URL, // Configure to use env vars: 'blapi_redis_1' in production
  },
});

function checkSig(req, res) {
  console.log('REQUEST', req.body);
  var sig = req.body.sig;
  var owner = req.owner;
  // Same data as before
  var data = 'i am a string';
  var message = ethUtil.toBuffer(data)
  var msgHash = ethUtil.hashPersonalMessage(message)
  console.log('SIG', sig, owner);
  // Get the address of whoever signed this message
  var signature = ethUtil.toBuffer(sig)
  var sigParams = ethUtil.fromRpcSig(signature)
  var publicKey = ethUtil.ecrecover(msgHash, sigParams.v, sigParams.r, sigParams.s)
  var sender = ethUtil.publicToAddress(publicKey)
  var addr = ethUtil.bufferToHex(sender)

  console.log('PUBLIC KEY', addr);

  if (addr) {
    // If the signature matches the owner supplied, create a
    // JSON web token for the owner that expires in 24 hours.
    var token = jwt.sign({user: addr}, 'i am another string',  { expiresIn: '1d' });
    res.status(200).send({ success: 1, token: token })
  } else {
    // If the signature doesn’t match, error out
    res.status(500).send({ err: 'Invalid address.'});
  }
}


const app = express();
app.use(bodyParser.json());

// Setup logger
// app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));

// Serve static assets
app.use(express.static(path.resolve(__dirname, '..', 'build')));

// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
});

app.post('/authenticate', checkSig);

module.exports = app;
