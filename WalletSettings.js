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


// const EC = require('elliptic').ec
// const ec = new EC('secp256k1')

// const privateKey = ec.keyFromPrivate('c57affb11a0c382fd0a41f9a2b605f82a89624ecca53fd2d142f15ecacb6c085');
// const walletAddress = privateKey.getPublic('hex');

// module.exports.privateKey = privateKey;
// module.exports.walletAddress = walletAddress;