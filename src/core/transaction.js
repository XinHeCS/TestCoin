const TScript = require('../TScript/TScript');
const Block = require('./block');

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