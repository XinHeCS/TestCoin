const level = require('level');
const Block = require('./block');
const Config = require('./coreConfig');

/**
 * A manager class to 
 */
class BlockChain {
    /**
     * Initialize a certain block chain
     * @param {string} chainDB The path of current block chain data
     */
    constructor(chainDB) {
        this.db = level(chainDB);
    }

    async getLatestBlock() {
        try {
            return await this.db.get(Config.TOP_BLOCK);
        } catch (error) {
            console.log(error);
            return undefined;
        }
    }

    /**
     * Query a block according to it's block number
     * @param {Number} number Block index
     */
    async getBlock(number) {
        try {
            return await this._readBlock(number);
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }

    /**
     * Add new block into the block chain
     * @param {Block} block The new block to be added 
     * into the block chain
     */
    async addBlock(block) {
        try {            
            await this.db.put(block.number, JSON.stringify(block));
            console.log('Add new block: ' + block.number + ' ...');
        } catch (error) {
            console.log(error);
        }
    }

    _readBlock(number) {
        let blockChainDB = this.db;
        return new Promise(function (resolve, reject) {
            // Read values from data base
            // and when it finishes, we will return 
            // back the target block through
            // this promise
            let blockStream = blockChainDB.createValueStream();
            blockStream.on('data', function (data) {
                let block = JSON.parse(data);
                if (block.number === number) {
                    resolve(block);
                }
            });

            blockStream.on('error', (err) => { reject(err); });
        });
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