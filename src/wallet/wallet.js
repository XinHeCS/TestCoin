const Block = require('../core/block');
const ECDSA = require('../util/ECDSA');
const crypto = require('crypto');
const nodeUtil = require('util');
const path = require('path');
const fs = require('fs');

const readFile = nodeUtil.promisify(fs.readFile);
const writeFile = nodeUtil.promisify(fs.writeFile);
const stat = nodeUtil.promisify(fs.stat);

class Account {
    constructor() {
        // this.accountHandle = level('../../DataBase/accounts.dat');
        // this.unlockAcc = null;
        // ...
        // console.log(__dirname + '../../KeyStore/priKey.data');
        this.priKeyPath = path.resolve('./KeyStore/priKey.data');
        this.pubKeyPath = path.resolve('./KeyStore/pubKey.data');
        this.currentAddress = null;
    }

    /**
     * Create a new account
     * @param {string} accountPath Use this dir to create a account
     */
    async createAccount(accountPath) {
        if (!fs.existsSync(accountPath)) {
            throw new Error(`Directory: ${accountPath} doesn't exists~`);
        }
        await ECDSA.createPriKey(this.priKeyPath);
    }

    async getAddress() {
        if (!this.currentAddress) {
            let pubKey = await this.getPubKey();
            let pubKeyHash = crypto.createHash('sha256').update(pubKey).digest();
            pubKeyHash = crypto.createHash('ripemd160').update(pubKeyHash).digest();
            let checkSum = crypto.createHash('sha256').update(pubKey).digest();
            checkSum = crypto.createHash('sha256').update(pubKey).digest();
    
            this.currentAddress =  Buffer.concat([pubKeyHash, checkSum]).toString('base64');
        }

        return this.currentAddress;
    }

    async getPubKey() {
        return await readFile(this.pubKeyPath);
    }
}

module.exports = Account;