const { Transaction, TxIn, TxOut, TxIndex, Coin } = require('../Transaction/transaction');
const BlockChain = require('../core/blockchain');
const TxPool = require('../Transaction/TxPool');
const TScript = require('../TScript/TScript');
// const Config = require('../core/coreConfig');
// const Block = require('../core/block');
const ECDSA = require('../util/ECDSA');
const crypto = require('crypto');
const { Writable, Readable } = require('stream');
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

    getBalance() {
        let balance = 0;
        for (let coin of this._pocket) {
            balance += coin.out.value;
        }
        for (let coin of this._spent) {
            balance -= coin.out.value;
        }

        return balance;
    }

    async refreshBalance() {
        await this.fetchBalance();
        return this.getBalance();
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
        if (to.length !== values.length) {
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
            vin.push(new TxIn(new TScript(sig, await this.getPubKey(), msg),
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

        let newTx = new Transaction(null, vin, vout);
        TxPool.getInstance().cacheTransaction(newTx);

        return newTx;
    }

    /* ========== private methods ========== */

    /**
     * Fetch balance from address
     * @param {string} address 
     */
    async _calculateBalance(address) {
        await this._getTxOut(address);
        await this._filterValidOut();
    }
    
    _getTxOut(address) {
        this._pocket = [];
        let Out = this._pocket;
        let TxHandle = this._blcHandle.getTxHandle();        

        return new Promise(function (resolve, reject) {
            TxHandle.createReadStream()
            .on('data', (data) => {
                let tx = Transaction.instance(JSON.parse(data.value));
                for (let i in tx.vout) {
                    if (tx.vout[i].address === address) {
                        Out.push(new Coin(i, tx.vout[i], data.key));
                    }
                }
            })
            .on('end', () => resolve())
            .on('error', (err) => reject(err));
        })
    }

    async _filterValidOut() {
        let filter = [];
         for (let coin of this._pocket) {
            if (!await this._isSpent(coin)) {
                filter.push(coin);
            }
         }
         this._pocket = filter;
    }

    /**
     * Check whether this coin is spent
     * @param {Coin} coin 
     */
    _isSpent(coin) {
        let IdxHandle = this._blcHandle.getTxIndexHandle();

        return new Promise(function (resolve, reject) {
            IdxHandle.get(coin.txHash)
            .then(
                (data) => {
                    let idx = JSON.parse(data);
                    if (idx.vSpent[coin.index] !== null) {
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                }
            );
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
                return [i, pay];
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

        return ret;
    }
}

// class _WritePocket extends Writable {
//     constructor(options) {
//         super(options);
//         this._pocket = options.pocket || [];
//     }

//     /**
//      * Internal function of write stream
//      * @param {Coin} chunk 
//      * @param {string} encoding 
//      * @param {Function} callback 
//      */
//     _write(chunk, encoding, callback) {
//         if (chunk instanceof Coin) {            
//             this._pocket.push(chunk);
//             callback();
//         }
//         else {
//             callback(new Error("Failed to read data base"));
//         }
//     }
// }

module.exports = Account;