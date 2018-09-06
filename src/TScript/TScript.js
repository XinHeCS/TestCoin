const ECDSA = require('../util/ECDSA');

class TScript {
    constructor(sig, pubKey) {
        this.sig = sig;
        this.pubKey = pubKey;
    }

    async eval(msg) {
        return await ECDSA.verify(this.pubKey, msg, this.sig);
    }
}


module.exports = TScript;