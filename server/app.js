const jwt = require('jsonwebtoken');
const ethUtil = require('ethereumjs-util');
const HttpProvider = require('ethjs-provider-http');
const Eth = require('ethjs-query');
const eth = new Eth(new HttpProvider('http://localhost:8545'));

eth.getBalance('0xb54a75d89e50d0dd8b39b55daef2de4f4885c03a', (err, d) => console.log(d.toString()))

// 0xb54a75d89e50d0dd8b39b55daef2de4f4885c03a
async function checkSig(req, res) {
  console.log('REQUEST', req.body);
  var sig = req.body.sig;
  var owner = req.owner;
  // Same data as before
  var data = `Login Attempt to I B RickRollin'`;
  var message = ethUtil.toBuffer(data)
  var msgHash = ethUtil.hashPersonalMessage(message)
  console.log('SIG', sig, owner);
  // Get the address of whoever signed this message
  var signature = ethUtil.toBuffer(sig)
  var sigParams = ethUtil.fromRpcSig(signature)
  var publicKey = ethUtil.ecrecover(msgHash, sigParams.v, sigParams.r, sigParams.s)
  var sender = ethUtil.publicToAddress(publicKey)
  var addr = ethUtil.bufferToHex(sender)

  console.log('PUBLIC KEY', { publicKey });

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

module.exports = {
  checkSig,
};
