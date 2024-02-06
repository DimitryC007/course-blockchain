const { Blockchain, Block, Transaction } = require("./BlockChain.js");
const { LightWallet } = require("./LightWallet.js");
const { wallet1, wallet2, wallet3 } = require("./WalletSettings.js");
const { MerkleTree } = require("merkletreejs");
const Crypto = require("crypto");

const initialAmount = 200;
const mineDifficulty = 5;

function calculateMerkleRoot(transactions) {
  const leaves = transactions.map((tx) => tx.calculateHash());
  const tree = new MerkleTree(leaves, Crypto.createHash.bind(null, "sha256"));
  return tree.getRoot().toString("hex");
}

// Function to create the initial transaction for wallet initialization
function createInitialTransaction(walletAddress, ammount) {
  return new Transaction(null, walletAddress, ammount);
}

// Initial ammount add for each 3 wallets
const initialTransaction1 = createInitialTransaction(
  wallet1.address,
  initialAmount
);

const initialTransaction2 = createInitialTransaction(
  wallet2.address,
  initialAmount
);

const initialTransaction3 = createInitialTransaction(
  wallet3.address,
  initialAmount
);

const initialTransactions = [
  initialTransaction1,
  initialTransaction2,
  initialTransaction3,
];

// Create a Merkle tree for transactions
const merkleRoot = calculateMerkleRoot(initialTransactions);

// Create a new block with transactions and the Merkle root
const initialBlock = new Block(Date.now(), initialTransactions, merkleRoot);
initialBlock.mineBlock(mineDifficulty, wallet1.address); // Mine the block -> gets a reward

let blockChain = new Blockchain();

const lightWallet2 = new LightWallet(blockChain, wallet2);
const lightWallet3 = new LightWallet(blockChain, wallet3);

// Add the new block to the blockchain
blockChain.addBlock(initialBlock);

const transaction1 = lightWallet2.sendFunds(wallet1.address, 30);
const transaction2 = lightWallet3.sendFunds(wallet1.address, 20);
const transaction3 = lightWallet3.sendFunds(lightWallet2.address, 10);
const transaction4 = lightWallet2.sendFunds(lightWallet3.address, 60);

const newBlock = new Block(Date.now(), [transaction1,transaction2,transaction3,transaction4], merkleRoot);
blockChain.addBlock(newBlock);

// Print the blockchain
console.log("\nBlockchain:", blockChain.chain);

// Print the balance of the wallet address
console.log("\nBalance of main wallet (wallet1):", blockChain.getBalanceOfAddress(wallet1.address));

console.log("\nStart mining transaction for wallet 1");
blockChain.minePendingTransaction(wallet1.address);

console.log("\nStart mining block for wallet 2");
newBlock.mineBlock(mineDifficulty ,wallet2.address);

console.log("\nBalance of wallet 1 ", blockChain.getBalanceOfAddress(wallet1.address));

console.log(JSON.stringify(blockChain, null, 4));

printWalletInfo();

function printWalletInfo()
{
    console.log("\nwallets info:")
    console.log("main wallet balance:",blockChain.getBalanceOfAddress(wallet1.address));
    console.log("light wallet 2 balance:",lightWallet2.getBalance());
    console.log("light wallet 3 balance:",lightWallet3.getBalance());
    console.log("");
    console.log("main wallet mined:" ,blockChain.getTotalMine(wallet1.address));
    console.log("light wallet 2 mined:" ,lightWallet2.getTotalMine());
    console.log("light wallet 3 mined:" ,lightWallet3.getTotalMine());
    console.log("");
    console.log("total fee:")
    console.log("nmain wallet fee:" ,blockChain.getTotalFee(wallet1.address));
    console.log("light wallet 2 fee:" ,lightWallet2.getTotalFee());
    console.log("light wallet 3 fee:" ,lightWallet3.getTotalFee());
}