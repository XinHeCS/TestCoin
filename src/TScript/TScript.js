const ECDSA = require('../util/ECDSA');

class TScript {
    /**
     * Constructor
     * @param {string} sig 
     * @param {Buffer} pubKey 
     * @param {string} hash 
     */
    constructor(sig, pubKey, hash) {
        this.sig = sig;
        this.pubKey = pubKey;
        this.msg = hash;
    }

    async verify() {
        return await ECDSA.verify(this.pubKey, this.hash, this.sig);
    }

    async checkAddress(address) {
        if (address = ECDSA.generateAddress(this.pubKey)) {
            return ;
        }
        else {
            throw Error('Unmatched pubKey and address');
        }
    }
}

TScript.instance = function (script) {
    let ret = new TScript(script.sig, script.pubKey, script.msg);
    return ret;
}

module.exports = TScript;