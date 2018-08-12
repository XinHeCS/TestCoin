const bc = require('../core/blockchain');
const config = require('../core/coreConfig');
const SHA256 = require('../util/SHA256');
const Helper = require('../util/helper');

class Miner {

    constructor() {
        this._handle = null;
    }

    /**========== private methods ========== */

    /**
     * Solve the puzzle with this block
     * @param {Block} block The block to be minded
     */
    _solve(block) {
        if (block.nonce === null) {
            let nonce = 0;
            let answer = '';
            do {
                answer = SHA256(block.number + block.preHash + 
                    block.data + block.difficulty + nonce.toString());
                ++nonce;
            } while (!this._matchDifficulty(answer, block.difficulty));

            block.nonce = nonce;
        }
        
        return block;
    }

    /**
     * Check if this hash value matches the difficulty 
     * @param {string} hash hash value to be verified
     * @param {number} difficulty Current difficulty
     */
    _matchDifficulty(hash, difficulty) {
        let answer = Helper.hexToBinary(hash);
        let pattern = '0'.repeat(difficulty);

        return answer.startsWith(pattern);
    }

    _getDifficulty() {
        let latestBlock = bc.getLatestBlock();
        if (latestBlock.number % config.BLOCK_CHECK_INTERVAL === 0 &&
            latestBlock.number !== 0) {
            return this._adjustDifficulty(latestBlock);
        }
        else {
            return latestBlock.difficulty;
        }
    }

    /**
     * Adjust the mining difficulty according to latest
     * block
     * @param {Block} latestBlock The latest block
     */
    _adjustDifficulty(latestBlock) {
        let preBlock = bc.getBlock(latestBlock - config.BLOCK_CHECK_INTERVAL);
        let idealTimeSpan = config.BLOCK_CHECK_INTERVAL * 
            config.BLOCK_GEN_SPEED;
        let actualTimeSpan = latestBlock.timeStamp - preBlock.timeStamp;

        if (actualTimeSpan < idealTimeSpan / 4) {
            actualTimeSpan = idealTimeSpan / 4;
        }
        if (actualTimeSpan > idealTimeSpan * 4) {
            actualTimeSpan = idealTimeSpan * 4;
        }

        return latestBlock.difficulty * (actualTimeSpan / idealTimeSpan);
    }

    /**========== public methods ========== */

    /**
     * Start mining
     */
    start() {
        let startTime = new Date().getTime();

        console.log('Start mining at ' + startTime);

        let newBlock = bc.generateNewBlock('Fuck');
        newBlock.difficulty = this._getDifficulty();
        newBlock = this._solve(newBlock);

        console.log('Total mining ' + (new Date().getTime() - startTime) + 'ms');

        this._handle = setTimeout(this.start.bind(this), 0);
    }

    /**
     * Stop the mining process
     */
    stop() {
        if (this._handle) {
            clearTimeout(this._handle);
        }
    }
}

module.exports = Miner;