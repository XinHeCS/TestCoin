const { Transaction, TxIn, TxOut } = require('../Transaction/transaction');
const BlockChain = require('../core/blockchain');
const TxPool = require('../Transaction/TxPool');
const config = require('../core/coreConfig');
const Account = require('../wallet/account');
const Block = require('../core/block');
const SHA256 = require('../util/SHA256');
const Helper = require('../util/helper');

class Miner {

    /**
     * Contractor of miner instance
     * @param {BlockChain} blc An instance of current attached
     * @param {Account} coinBase
     * block chain.
     */
    constructor(blc, coinBase) {
        this._minerHandle = null;
        this._blcHandle = blc;
        this._coinBase = coinBase;
    }

    /* ========== public methods ========== */

    /**
     * Start mining
     */
    async start() {
        // Generate coin base transaction
        let cbTx = new Transaction(null, 
                                    [], 
                                    [new TxOut(await this._coinBase.getAddress(), 5)]);
        TxPool.getInstance().cacheTransaction(cbTx);

        let startTime = new Date().getTime();        

        let latestBlock = await this._blcHandle.getLatestBlock();
        let newBlock = new Block(latestBlock.number + 1,
                                latestBlock.preHash,
                                this._packTransactions().concat([cbTx.getHash()]),
                                latestBlock.difficulty,
                                null);
        newBlock.difficulty = await this._getDifficulty(latestBlock);
        newBlock.preHash = latestBlock.getHash();

        // Mining process
        console.log('Start mining at ' + startTime);
        newBlock = this._solve(newBlock);
        console.log('Total mining ' + (new Date().getTime() - startTime) + 'ms');
        // End ming

        await this._blcHandle.addBlock(newBlock);

        // this.minerHandle = setTimeout(this.start.bind(this), 0);
    }

    /**
     * Stop the mining process
     */
    stop() {
        if (this._minerHandle) {
            clearTimeout(this._minerHandle);
            this._minerHandle = null;
        }
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
        let preBlock = await this._blcHandle
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

    /**
     * @returns {Array<string>}
     */
    _packTransactions() {
        let ret = [];

        for (let i = 0; i < 5; ++i) {
            let hash = TxPool.getInstance().pickHash();
            if (!hash) {
                break;
            }
            ret.push(hash);
        }

        return ret;
    }
}

module.exports = Miner;