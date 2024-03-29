# Election - DAPP Tutorial

Build your first decentralized application, or Dapp, on the Ethereum Network with this tutorial!

Full Free Video Tutorial:\*\*
https://youtu.be/3681ZYbDSSk

## 2022 Updated Code

out-of-the-box for use!

Fix several issues, check CHANGELOG for detail.

## Dependencies

Install these prerequisites to follow along with the tutorial. See free video tutorial or a full explanation of each prerequisite.

- NPM: https://nodejs.org
- Truffle: https://github.com/trufflesuite/truffle
- Ganache: http://truffleframework.com/ganache/
- Metamask: https://metamask.io/

## Step 1. Clone the project

`git clone https://github.com/ArchLinuxStudio/election`

## Step 2. Install dependencies

```
$ cd election
$ npm install
```

## Step 3. Start Ganache

Open the Ganache GUI client that you downloaded and installed. This will start your local blockchain instance. See free video tutorial for full explanation.

## Step 4. Compile & Deploy Election Smart Contract

`$ truffle migrate --reset`
You must migrate the election smart contract each time your restart ganache.

## Step 5. Configure Metamask

See free video tutorial for full explanation of these steps:

- Unlock Metamask
- Connect metamask to your local Etherum blockchain provided by Ganache.
- Import an account provided by ganache.

## Step 6. Run the Front End Application

`$ npm run dev`
Visit this URL in your browser: http://localhost:3000

If you get stuck, please reference the free video tutorial.

---

## Notes

1. Use `web3.eth.getAccounts()` to get accounts now
2. To bootstrap sample truffle project, use command `truffle unbox pet-shop`

---

## Deploy to sepolia test network

Since the rinkeby test network has been deprecated, we use sepolia test network now. This can take dozens of hours, depending on your machine configuration and internet speed. This will cost you close to 100GB or so of hard drive space.

1. Install consensus clinet: Prysum.

Ethereum has been migrate to POS now, so a consensus client is needed. We use [Prysum](https://docs.prylabs.network/docs/getting-started) here.

Create a folder called ethereum, and then two subfolders within it: consensus and execution. Navigate to your consensus directory and run the following commands:

```bash
mkdir prysm && cd prysm
curl https://raw.githubusercontent.com/prysmaticlabs/prysm/master/prysm.sh --output prysm.sh && chmod +x prysm.sh
```

2. Run geth node

```bash
geth --sepolia --http --http.api personal,eth,net,web3 --allow-insecure-unlock
```

In the output log you can see the `Loaded JWT secret file` path, keep it and we will use it next.

3. Run a beacon node using Prysm

First you need to download the [Sepolia genesis state from Github](https://github.com/eth-clients/merge-testnets/blob/main/sepolia/genesis.ssz) into your consensus/prysm directory. Then use the following command to start a beacon node that connects to your local execution node:

```bash
./prysm.sh beacon-chain --execution-endpoint=http://localhost:8551 --sepolia --suggested-fee-recipient=0x01234567722E6b0000012BFEBf6177F1D2e9758D9 --jwt-secret=YOUR_JWT_FILE_PATH --genesis-state=genesis.ssz
```

Wait for a while and you can see the sync has started. Check syncing status:

```bash
curl http://localhost:3500/eth/v1/node/syncing
```

4. Create a new account

```bash
geth --sepolia account new
```

5. Attach into geth console

```bash
geth --sepolia attach
```

And you can do many things in geth console

```bash
eth.syncing     #check the syncing status
eth.accounts    #check all accounts
eth.getBalance(eth.accounts[0]) #check account balance
personal.unlockAccount(eth.accounts[0],null,1200)   #unlock a certain accont for 20 minutes
```

6. Acquire eth from https://sepoliafaucet.com/

Here they require that you have to login your google account, which is disgusting.

7. Migrate

```bash
truffle migrate --reset --compile-all --network sepolia
```

8. Verify deployment

```bash
geth --sepolia attach
```

```bash
var contractAddress = "Your_Contract_Address"
var contractAbi = [Your_ABI_Array] #copy the abi array in build/contracts/Election.json, turn it into one line style
var electionContract = web3.eth.contract(contractAbi)
var electionInstance = electionContract.at(contractAddress)
electionInstance.candidates(1)
electionInstance.vote(1, {from: eth.accounts[0]});
```
