const Block = require('../core/block');
const BlockChain = require('../core/blockchain');
const config = require('../core/coreConfig');
const SHA256 = require('../util/SHA256');
const Helper = require('../util/helper');

class Miner {

    /**
     * Contractor of miner instance
     * @param {BlockChain} db An instance of current attached
     * block chain.
     */
    constructor(db) {
        this.minerHandle = null;
        this.blcHandle = db;
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

    async _getDifficulty(latestBlock) {
        if (latestBlock.number % config.BLOCK_CHECK_INTERVAL === 0 &&
            latestBlock.number !== 0) {
            return await this._adjustDifficulty(latestBlock);
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
    async _adjustDifficulty(latestBlock) {
        let preBlock = await this.blcHandle
                                .getBlock(latestBlock.number - config.BLOCK_CHECK_INTERVAL);
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
    async start() {
        let startTime = new Date().getTime();        

        let latestBlock = await this.blcHandle.getLatestBlock();
        let newBlock = new Block(latestBlock.number + 1,
                                latestBlock.preHash,
                                "Okay!",
                                latestBlock.difficulty,
                                null);
        newBlock.difficulty = await this._getDifficulty(latestBlock);
        newBlock.preHash = latestBlock.getHash();

        // Mining process
        console.log('Start mining at ' + startTime);
        console.log(newBlock.difficulty);        
        newBlock = this._solve(newBlock);
        console.log('Total mining ' + (new Date().getTime() - startTime) + 'ms');
        // End ming

        await this.blcHandle.addBlock(newBlock);

        this.minerHandle = setTimeout(this.start.bind(this), 0);
    }

    /**
     * Stop the mining process
     */
    stop() {
        if (this.minerHandle) {
            clearTimeout(this.minerHandle);
            this.minerHandle = null;
        }
    }
}

module.exports = Miner;