const jwt = require('jsonwebtoken');
const ethUtil = require('ethereumjs-util');
const HttpProvider = require('ethjs-provider-http');
const Eth = require('ethjs-query');
const eth = new Eth(new HttpProvider('http://localhost:8545'));

eth.getBalance('0xb54a75d89e50d0dd8b39b55daef2de4f4885c03a', (err, d) => console.log(d.toString()))


function getPublicKeyFromSignedMessage(sig, owner) {
  try {
    // Same data as before
    const data = `Login Attempt to I B RickRollin'`;
    const message = ethUtil.toBuffer(data)
    const msgHash = ethUtil.hashPersonalMessage(message)

    // Get the address of whoever signed this message
    const signature = ethUtil.toBuffer(sig)
    const sigParams = ethUtil.fromRpcSig(signature)
    const publicKey = ethUtil.ecrecover(msgHash, sigParams.v, sigParams.r, sigParams.s)
    const sender = ethUtil.publicToAddress(publicKey)
    const addr = ethUtil.bufferToHex(sender)
    return addr;
  } catch (e) {
    throw new Error('Cannot recover public key');
  }
}

// 0xb54a75d89e50d0dd8b39b55daef2de4f4885c03a
async function createJWT(publicKey) {
  if (publicKey) {
    // If the signature matches the owner supplied, create a
    // JSON web token for the owner that expires in 24 hours.
    try {
      const token = jwt.sign({ user: publicKey }, 'cryptographically secure secret phrase',  { expiresIn: '1d' });
      return token;
    } catch (e) {
      throw new Error('Cannot create JWT');
    }
  } else {
    // If the signature doesn’t match, error out
    throw new Error('Cannot create JWT with empty public key');
  }
}

const createAuth = options => (req, res, next) => {
  const { onError } = options || {};

  try {
    const userPublicKey = getPublicKeyFromSignedMessage(req.body.sig, req.owner);
    const token = createJWT(userPublicKey);
    next();
  } catch (err) {
    console.error(err);
    if (onError) {
      onError(err, req, res, next);
      return null;
    }
    res.status(500).send();
  }
};

const createPaywall = options = (req, res, next) => {
  const { onError } = options || {};

  try {
    const userPublicKey = getPublicKeyFromSignedMessage(req.body.jwt);
    const token = createJWT(userPublicKey);
    next();
  } catch (err) {
    console.error(err);
    if (onError) {
      onError(err, req, res, next);
      return null;
    }
    res.status(500).send();
  }
}

module.exports = {
  createAuth,
};
