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
}

TxIn.instance = function (txIn) {
    return new TxIn(TScript.instance(txIn.script),
                    txIn.preTx,
                    txIn.index);
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
}

class Transaction {
    /**
     * Constructor
     * @param {number} id ID of TxIn
     * @param {Array<TxIn>} vin Array of TxIn
     * @param {Array<TxOut>} vout Array of TXOut
     */
    constructor(id, vin, vout) {
        this.id = id || new Date().getTime();
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
}

Transaction.instance = function (tx) {
    let newTx =  new Transaction(tx.id, [], tx.vout);
    for (let inObj of tx.vin) {
        newTx.vin.push(TxIn.instance(inObj));
    }

    return newTx;
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

class Coin {
    /**
     * Ctor
     * @param {number} index 
     * @param {TxOut} txOut 
     * @param {string} txHash 
     */
    constructor(index, txOut, txHash) {
        this.index = index;
        this.out = txOut;
        this.txHash = txHash;
    }
}


module.exports = {
    Transaction,
    TxIn,
    TxOut,
    TxIndex,
    Coin
}
