const bc = require('../core/blockchain');
const config = require('../core/coreConfig');
const SHA256 = require('../util/SHA256');
const Helper = require('../util/helper');

class Miner {

    constructor() {
        this._handle = null;
    }

    /* ========== private methods ========== */

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
                // console.log('Test: ' + nonce + '\t' + 'result: ' + answer);
            } while (!this._matchDifficulty(answer, block.difficulty));

            block.nonce = nonce;
            console.log('Test: ' + nonce + '\t' + 'result: ' + answer);
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
        let preBlock = bc.getBlock(latestBlock.number - config.BLOCK_CHECK_INTERVAL);
        let idealTimeSpan = config.BLOCK_CHECK_INTERVAL * 
            config.BLOCK_GEN_SPEED;
        let actualTimeSpan = latestBlock.timeStamp - preBlock.timeStamp;

        if (actualTimeSpan < idealTimeSpan / 4) {
            actualTimeSpan = idealTimeSpan / 4;
        }
        if (actualTimeSpan > idealTimeSpan * 4) {
            actualTimeSpan = idealTimeSpan * 4;
        }

        // Adjust difficulty according to formula
        // 2^(D_n - D_o) = T_n / T_o =>
        // D_n = D_o + log2(T_n / T_o)
        return latestBlock.difficulty + Math.log2(idealTimeSpan / actualTimeSpan);
    }

    /* ========== public methods ========== */

    /**
     * Start mining
     */
    start() {
        let startTime = new Date().getTime();

        console.log('Start mining at ' + startTime);

        let newBlock = bc.generateNewBlock('Okay');
        newBlock.difficulty = this._getDifficulty();
        console.log(newBlock.difficulty);
        newBlock = this._solve(newBlock);

        console.log('Total mining ' + (new Date().getTime() - startTime) + 'ms');

        bc.addBlock(newBlock);

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