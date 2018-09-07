const { Transaction, TxIn, TxOut, TxIndex } = require('../Transaction/transaction');
const BlockChain = require('../core/blockchain');
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
    }

    /**
     * Create a new account
     * @param {string} accountPath Use this dir to create a account
     */
    async createAccount(accountPath) {
        if (!fs.existsSync(accountPath)) {
            throw new Error(`Directory: ${accountPath} doesn't exists`);
        }
        await ECDSA.createPriKey(this._priKeyPath);
    }

    async getAddress() {
        if (!this._currentAddress) {
            let pubKey = await this.getPubKey();
            let pubKeyHash = crypto.createHash('sha256').update(pubKey).digest();
            pubKeyHash = crypto.createHash('ripemd160').update(pubKeyHash).digest();
            let checkSum = crypto.createHash('sha256').update(pubKey).digest();
            checkSum = crypto.createHash('sha256').update(pubKey).digest();
    
            this._currentAddress =  Buffer.concat([pubKeyHash, checkSum]).toString('base64');
        }

        return this._currentAddress;
    }

    async getPubKey() {
        return await readFile(this._pubKeyPath);
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

        // Construct this transaction
        let vin = [];
        let total = values.reduce((a, b) => a + b);
        let coins = this._chooseTxOut(total);
        // Sign for each TxOut

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
                                pocket.push({
                                    index : i,
                                    out : tx.vout[i],
                                    txHash : data.key
                                });
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
     * Select out UTXOs for some payments
     * @param {number} total Total payment
     * @returns {Array<Object<TxOut, string>>}
     */
    _chooseTxOut(total) {
        let ret = [];

        for (let coin of this._pocket) {
            if (total > 0) {
                ret.push(coin);
                total -= coin.out.value;
            }
            else {
                break;
            }
        }

        return ret;
    }
}

module.exports = Account;