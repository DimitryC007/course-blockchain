class LightWallet {
    constructor(blockchain, wallet) {
        this.blockchain = blockchain;
        this.wallet = wallet;
        this.initialAmount = 200;
    }

    getTransactions() {
        return this.blockchain.chain
            .flatMap(block => block.transactions)
            .filter(tx => tx.fromAddress === this.wallet.address || tx.toAddress === this.wallet.address);
    }

    getBalance() {
        return this.blockchain.getBalanceOfAddress(this.wallet.address);
    }

    getTotalMine()
    {
        return this.blockchain.getTotalMine(this.wallet.address);
    }

    getTotalFee()
    {
        return this.blockchain.getTotalFee(this.wallet.address);
    }

    hasTransaction(txHash) {
        return this.blockchain.chain
            .flatMap(block => block.transactions)
            .some(tx => tx.calculateHash() === txHash && (tx.fromAddress === this.wallet.address || tx.toAddress === this.wallet.address));
    }

    sendFunds(addressTo, amount)
    {
        if(amount > this.getBalance())
        {
            throw new Error("You cannot send an amount greater than your available balance.");
        }

        return this.blockchain.sendFunds(this.wallet.key, this.wallet.address,addressTo, amount);
    }
}

module.exports.LightWallet = LightWallet;