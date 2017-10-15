const jwt = require('jsonwebtoken');
const ethUtil = require('ethereumjs-util');
const HttpProvider = require('ethjs-provider-http');
const Eth = require('ethjs');
const eth = new Eth(new HttpProvider('https://ropsten.infura.io/metamask'));

const PK_MAP = {
  '0X6DCFE11ED24897FBEB64423A39FD421E278DD55E': '0xbf09be7DD30A7bb833300B4A9fAC4E461Bf74Bb5',
  '0X136A367ACC86CD02D50768B10527BD7117694C2E': '0xd0082cEd53C102D56454419603F5B974dDeF316E'
};

eth.getBalance('0x6DcfE11eD24897FbEb64423A39FD421e278DD55E', (err, d) => console.log(d.toString()))
// 

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
function createJWT(publicKey) {
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
    req.jwt = token;
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

const createPaywall = options => async (req, res, next) => {
  const { onError, onInactive, subscriptionKey, abi } = options || {};

  try {
    const authorization = req.headers.authorization;
    const token = jwt.verify(authorization, 'cryptographically secure secret phrase');
    const { user, iat, exp } = token;

    const contract = eth.contract(abi).at(subscriptionKey)

    console.log({ contract, user })
    const { status } = await contract.getDetailsAt(PK_MAP[user.toUpperCase()])
    // Query for subscription status here
    const isSubscriptionActive = status.toString() == 0;

    if (!isSubscriptionActive) {
      if (onInactive) {
        return onInactive(req, res, next);
      }

      return res.status(403).send('not ok');
    }

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
  createPaywall,
};
