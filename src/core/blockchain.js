const level = require('level');
const Block = require('./block');
const Config = require('./coreConfig');

/**
 * A manager class to block chain
 */
class BlockChain {
    /**
     * Initialize a certain block chain
     * @param {string} chainDB The path of current block chain data
     */
    constructor(chainDB) {
        // A reference to block chain's data base
        this.db = level(chainDB);
    }

    async getLatestBlock() {        
        return await this._readLatestBlock();
    }

    /**
     * Query a block according to it's block number
     * @param {Number} number Block index
     */
    async getBlock(number) {        
        return await this._readBlock(number);
    }

    /**
     * Get a block from data base according to it's hash value
     * @param {string} hash Hash value of s block
     */
    async getBlockByHash(hash) {
        return await this._readBlockHash(hash);
    }

    /**
     * Add new block into the block chain
     * @param {Block} block The new block to be added 
     * into the block chain
     */
    async addBlock(block) {
        try {
            let blockStr = JSON.stringify(block)
            await this.db.put(block.generateBlockHash(), blockStr);
            await this.db.batch()
                        .put(Config.TOP_BLOCK, blockStr)
                        .write();
            console.log('Add new block: ' + block.number + ' ...');
        } catch (error) {
            console.log(error);
        }
    }

    // ================ Internal method(s) ==================

    _readBlock(number) {
        let blockChainDB = this.db;
        return new Promise(function (resolve, reject) {
            // Read values from data base
            // and when it finishes, we will return 
            // back the target block through
            // this promise
            let blockStream = blockChainDB.createValueStream();

            blockStream
            .on('data', (data) => {
                let block = JSON.parse(data);
                if (block.number === number) {
                    resolve(block);
                    blockStream.destroy("Close data base.");
                }
            })
            .on('error', (err) => { 
                reject(err); 
            })
            .on('end', () => { 
                reject("Didn't find block " + number); 
            });
        });
    }

    _readBlockHash(hash) {
        let blockChainDB = this.db;
        return new Promise(function (resolve, reject) {
            let hashStream = blockChainDB.createReadStream();

            hashStream
            .on('data', (data) => {
                if (data.key === hash) {
                    resolve(JSON.parse(data.value));
                    blockStr.destroy("Close data base.");
                }
            })
            .on('error', (err) => {
                reject(err);
            })
            .on('end', () => {
                reject("Didn't find block " + hash);
            });
        });
    }

    _readLatestBlock() {
        let blockChainDB = this.db;
        return new Promise(function (resolve, reject) {
            blockChainDB.get(Config.TOP_BLOCK)
            .then(
                function (data) {
                    let block = JSON.parse(data);
                    resolve(block);
                },
                function (err) {
                    reject(err);
                }
            );
        })
    }
}

module.exports = BlockChain;

// let blockChain = [
//     new Block(0, 0, [1, 2, 3], 16, null)
// ];

// /**
//  * Generate a new un-minded block added to the top of block chain
//  * @param {any} data Current block data
//  * @returns {Block} The new block
//  */
// function generateNewBlock(data) {
//     const topBlock = getLatestBlock();
//     const preHash = generateBlockHash(topBlock);

//     return new Block(topBlock.number + 1, preHash, data, 
//         topBlock.difficulty);
// }

// /**
//  * To verify if the block is legal
//  * @param {Block} block The block to be verified
//  * @returns {boolean} whether this block is valid
//  */
// function isValidBlock(block) {
//     const preBLock = getBlock(block.number - 1);

//     if (preBLock !== undefined) {
//         if (preBLock.hash !== block.preHash) {
//             console.error('Unmatched previous hash!');
//             return false;
//         }
//         else if (block.hash !== generateBlockHash(block)) {
//             console.error('Unmatched block hash!');
//             return false;
//         }
//         // TODO : Should also check if the data is valid here
//         return true;
//     }

//     return false;
// }