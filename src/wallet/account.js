const { Transaction, TxIn, TxOut, TxIndex, Coin } = require('../Transaction/transaction');
const BlockChain = require('../core/blockchain');
const TxPool = require('../Transaction/TxPool');
const TScript = require('../TScript/TScript');
const Config = require('../core/coreConfig');
const Block = require('../core/block');
const ECDSA = require('../util/ECDSA');
const crypto = require('crypto');
const nodeUtil = require('util');
const path = require('path');
const fs = require('fs');

// Wrapper some useful functions
const readFile = nodeUtil.promisify(fs.readFile);
const writeFile = nodeUtil.promisify(fs.writeFile);
const stat = nodeUtil.promisify(fs.stat);

class Account {    
    /**
     * Constructor
     * @param {BlockChain} blc BLockChain where current account attached
     */
    constructor(blc) {
        // this.accountHandle = level('../../DataBase/accounts.dat');
        // this.unlockAcc = null;
        // ...
        // console.log(__dirname + '../../KeyStore/priKey.data');
        this._blcHandle = blc;
        this._priKeyPath = path.resolve('./KeyStore/priKey.data');
        this._pubKeyPath = path.resolve('./KeyStore/pubKey.data');
        this._currentAddress = null;
        this._pocket = [];
        this._spent = [];
        this._used = [];
    }

    /**
     * Create a new account
     * @param {string} accountPath Use this dir to create a account
     */
    async createAccount(accountPath) {
        if (!fs.existsSync(accountPath)) {
            throw new Error(`Directory: ${accountPath} doesn't exists`);
        }
        await ECDSA.createPriKey(this._priKeyPath, this._pubKeyPath);
    }

    async getAddress() {
        if (!this._currentAddress) {            
            this._currentAddress = ECDSA.generateAddress(await this.getPubKey());
        }

        return this._currentAddress;
    }

    async getPubKey() {
        return await readFile(this._pubKeyPath);
    }

    async showBalance() {
        if (this._pocket.length === 0) {
            await this.fetchBalance();
        }

        let balance = 0;
        for (let coin of this._pocket) {
            balance += coin.out.value;
        }

        return balance;
    }

    async fetchBalance() {
        await this._calculateBalance(await this.getAddress());
    }

    /**
     * Create a transaction.
     * Send the values of TestCoin to the addresses stored in
     * to respectively
     * @param {string} from Address from
     * @param {Array<string>} to Addresses to
     * @param {Array<number>} values Transactions value 
     * @return {Transaction}
     */
    async createTransaction(from, to, values) {
        // Check for validation of this transaction
        if (to.length !== value.length) {
            throw new Error(`Length of target addresses doesn't match with values'`);
        }
        if (!from) {
            from = await this.getAddress();
        }
        if (this._pocket.length === 0) {
            await this.fetchBalance();
        }

        // Check for balance
        let total = values.reduce((a, b) => a + b);
        let [coinCount, pay] = this._checkBalance(total);
        if (coinCount === -1) {
            throw new Error('Short balance.');
        }

        // Construct this transaction
        let vin = [];
        let coins = this._chooseTxOut(coinCount);
        // Sign for each TxOut and pack them into vin
        let outMsg = to.concat(values).join('');
        for (let coin of coins) {
            let msg = crypto.createHash('sha256').update(coin.address + outMsg).digest('hex');
            let sig = await ECDSA.sig(this._priKeyPath, msg);
            vin.push(new TxIn(new TScript(sig, from),
                            coin.txHash,
                            coin.index));
        }
        // Construct vout
        let vout = [];
        for (let i in to) {
            vout.push(new TxOut(to[i], values[i]));
        }
        // Check changes
        if (pay > total) {
            vout.push(new TxOut(from, pay - total));
        }

        TxPool.getInstance().cacheTransaction(new Transaction(vin, vout));
    }

    /* ========== private methods ========== */

    /**
     * Fetch balance from address
     * @param {string} address 
     */
    _calculateBalance(address) {
        let pocket = this._pocket;
        let TxHandle = this._blcHandle.getTxHandle();
        let TxIdxHandle = this._blcHandle.getTxIndexHandle();

        return new Promise(function (resolve, reject) {
            let stream = TxHandle.createReadStream();
            // Scan all the transactions
            stream
            .on('data', (data) => {
                let tx = JSON.parse(data.value);
                // Fetch the TxIndex respect to current transaction
                TxIdxHandle.get(data.key)
                .then(
                    (idx) => {
                        for (let i in tx.vout) {
                            // if this TxOut belongs to this address
                            // and haven't been spent
                            if (tx.vout[i].address === address &&
                                idx.xSpent[i] === null) {
                                pocket.push(new Coin(i, tx.vout[i], data.key));
                            }
                        }
                    }
                );
            })
            .on('end', () => resolve())
            .on('error', (err) => reject(err));
        })
    }

    /**
     * Check if we have enough money to pay
     * @param {number} total Total payment
     * @return {Array<number>} Return the number of coins we would
     *                  use to cover the costs.
     */
    _checkBalance(total) {
        let i = 0;
        let pay = 0;
        for (let coin of this._pocket) {
            if (total > 0) {
                total -= coin.out.value;
                pay += coin.out.value;
                ++i;
            }
            else {
                return i, pay;
            }
        }

        return total <= 0 ? [i, pay] : [-1, 0];
    }

    /**
     * Select out UTXOs for some payments
     * @param {number} total Total number of coins
     * @returns {Array<Coin>}
     */
    _chooseTxOut(total) {
        let ret = this._pocket.slice(0, total);
        this._spent.concat(ret);
        this._pocket.splice(0, total);

        return tot;
    }
}

module.exports = Account;