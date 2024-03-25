const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const privateKey1 = ec.genKeyPair();
const walletAddress1 = privateKey1.getPublic('hex');

const privateKey2 = ec.genKeyPair();
const walletAddress2 = privateKey2.getPublic('hex');

const privateKey3 = ec.genKeyPair();
const walletAddress3 = privateKey3.getPublic('hex');

module.exports.wallet1 = { key: privateKey1, address: walletAddress1 };
module.exports.wallet2 = { key: privateKey2, address: walletAddress2 };
module.exports.wallet3 = { key: privateKey3, address: walletAddress3 };