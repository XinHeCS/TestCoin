const TScript = require('../TScript/TScript');
const SHA256 = require('../util/SHA256');
const Block = require('../core/block');

class TxIn {
    /**
     * Constructor 
     * @param {TScript} sr 
     * @param {string} hash Previous transaction's hash
     * @param {number} index Position of referred out
     */
    constructor (sr, hash, index) {
        this.script = sr;
        this.preTx = hash;
        this.index = index;
    }

    isNull() {
        return this.preTx === null;
    }

    isMine() {
        // TODO
    }

    getBalance() {
        if (this.isMine()) {
            
        }
        return 0;
    }
}

class TxOut {
    /**
     * Constructor
     * @param {string} addr Receiving address
     * @param {number} value Receiving value
     */
    constructor(addr, value) {
        this.address = addr;
        this.value = value;
    }

    getValue() {
        return this.value;
    }
}

class Transaction {
    /**
     * Constructor
     * @param {Array<TxIn>} vin Array of TxIn
     * @param {Array<TxOut>} vout Array of TXOut
     */
    constructor(vin, vout) {
        this.id = new Date().getTime();
        this.vin = vin;
        this.vout = vout;
    }

    isCoinBase() {
        return this.vin.length === 1 && this.vin[0].isNull();
    }

    getHash() {
        return SHA256(JSON.stringify(this));
    }

    /**
     * Compare two transactions according to their hash
     * @param {Transaction} tx 
     */
    equals(tx) {
        return this.getHash() === tx.getHash();
    }

    /**
     * CHeck whether a transaction is valid
     */
    async checkTransaction() {
        // Check coin base
        if (this.isCoinBase()) {
            return true;
        }
        // Check budget balance
        let value = 0;
        for (let txIn of this.vin) {
            value += txIn.getBalance();
        }
        for (let txOut of this.vout) {
            value -= txOut.getValue();
        }

        return value >= 0;
    }
}

class TxIndex {
    /**
     * Constructor
     * @param {Array<TxOut>} vout 
     */
    constructor(vout) {
        this.vSpent = Array(vout.length).fill(null);
    }
}


module.exports = {
    Transaction,
    TxIn,
    TxOut,
    TxIndex
}
