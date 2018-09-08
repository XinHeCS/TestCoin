const level = require('level');
const Block = require('./block');
const Config = require('./coreConfig');
const {Transaction, TxIn, TxOut} = require('../Transaction/transaction');

/**
 * A manager class to block chain
 */
class BlockChain {
    /**
     * Initialize a certain block chain
     * @param {string} chainDB The path of current block chain data
     * @param {string} txDB The path of current transactions data
     * @param {string} txIndexDb The path of current tx index data     
     */
    constructor(chainDB, txDB, txIndexDb) {
        // A reference to block chain's data base
        this._db = level(chainDB);
        this._txdb = level(txDB);
        this._txIndexdb = level(txIndexDb);
        // Symbol to control whether to 
        // invoke _checkChain() or not
        this._check = true;
    }

    getBlocksHandle() {
        return this._db;
    }

    getTxHandle() {
        return this._txdb;
    }

    getTxIndexHandle() {
        return this._txIndexdb;
    }

    getTxPoolHandle() {
        return this._txPool;
    }

    async getLatestBlock() {   
        if (this._check) {
            await this._checkChain();
        }             
        return await this._readBlockHash(Config.TOP_BLOCK);
    }

    /**
     * Query a block according to it's block number
     * @param {Number} number Block index
     */
    async getBlock(number) {        
        if (this._check) {
            await this._checkChain();
        }       
        return await this._readBlock(number);
    }

    /**
     * Get a block from data base according to it's hash value
     * @param {string} hash Hash value of s block
     */
    async getBlockByHash(hash) {
        if (this._check) {
            await this._checkChain();
        }
        // return await this._readBlockHash(hash);
        return await this._readBlockHash(hash);
    }

    /**
     * Add new block into the block chain
     * @param {Block} block The new block to be added 
     * into the block chain
     */
    async addBlock(block) {
        if (this._check) {
            await this._checkChain();
        }
        return await this._writeBlock(block);
    }

    /**
     * Fetch transactions according to its hash value
     * @param {string} hash 
     */
    async getTransaction(hash) {
        return await this._readTransaction(hash);
    }

    // ================ Internal method(s) ==================

    /**
     * Check the status of current block chain.
     * If there exist no genesis block,
     * we will generate one for it.
     * Generally, this function shall 
     * only be invoked once and that's 
     * when the first time current block chain 
     * is accessed.
     */
    async _checkChain () {
        // CLose the check symbol
        this._check = false;
        try {
            await this._readBlockHash(Config.TOP_BLOCK);
        } catch (error) {
            let genesis = new Block(0, '0', 
                                    'Test Coin', Config.BLOCK_INIT_DIFFICULTY,
                                    null);
            await this._writeBlock(genesis);
        }
    }

    _readBlock(number) {
        let blockChainDB = this._db;
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
                    resolve(Block.instance(block));
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
        let blockChainDB = this._db;
        return new Promise(function (resolve, reject) {
            blockChainDB.get(hash)
            .then(
                function (data) {
                    let block = JSON.parse(data);
                    resolve(Block.instance(block));
                },
                function (err) {
                    reject(err);
                }
            );
        });
    }

    // _readLatestBlock() {
    //     let blockChainDB = this.db;
    //     return new Promise(function (resolve, reject) {
    //         blockChainDB.get(Config.TOP_BLOCK)
    //         .then(
    //             function (data) {
    //                 let block = JSON.parse(data);
    //                 resolve(block);
    //             },
    //             function (err) {
    //                 reject(err);
    //             }
    //         );
    //     })
    // }

    /**
     * Write new block into levelDB
     * @param {Block} block New block to write into 
     *                      data base.
     */
    _writeBlock(block) {
    let blockStr = JSON.stringify(block);
        return Promise.all([
            this._db.put(block.getHash(), blockStr),
            this._db.put(Config.TOP_BLOCK, blockStr)
        ]);
    }

    _readTransaction(hash) {
        let txHandle = this._txdb;
        return new Promise(function (resolve, reject) {
            txHandle.get(hash)
            .then(
                (tx) => resolve(Transaction.instance(tx)),
                (err) => reject(err)
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