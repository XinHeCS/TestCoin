const SHA256 = require('../util/SHA256');

class Block {
    constructor (number, preHash, data, difficulty, nonce) {
        this.number = number;
        this.preHash = preHash;
        this.data = data;
        this.timeStamp = new Date().getTime();
        this.difficulty = difficulty;
        this.nonce = nonce;
    }

    /**
     * Calculate the hash of some certain block
     * using sha256 algorithm
     * @returns {string} A hex-fy hash string
     */
    getHash() {    
        let val = this.number + this.preHash + this.timeStamp + 
        this.data + this.difficulty + this.nonce;

        return SHA256(val);
    }
}

Block.instance = function(obj) {
    return new Block(obj.number,
                    obj.preHash,
                    obj.data,
                    obj.difficulty,
                    obj.nonce);
};


module.exports = Block;
