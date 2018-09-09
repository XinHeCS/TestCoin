const { Transaction, TxIn, TxOut, TxIndex } = require('../Transaction/transaction');
const TxPool = require('../Transaction/TxPool');
const Config = require('./coreConfig');
const Block = require('./block');
const level = require('level');

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
        await this._writeBlock(block);
        await this._writeTransaction(block.data);
    }

    /**
     * Fetch transactions according to its hash value
     * @param {string} hash 
     */
    async getTxByHash(hash) {
        return await this._readTransaction(hash);
    }

    /**
     * Get the values of txIn and also 
     * check signature at the same time
     * @param {Transaction} tx
     */
    async getValueIn(tx) {
        if (tx.isCoinBase()) {
            return 0;
        }
        else {
            let ret = 0;
            for (let txIn of tx.vin) {
                let preTx = await this.getTxByHash(txIn.preTx);
                await txIn.script.checkAddress(preTx.vout[txIn.index].address);
                await txIn.script.verify();
                ret += preTx.vout[txIn.index].value;
            }
            return ret;
        }
    }

    /**
     * Get the values of out 
     * @param {Transaction} tx
     */
    getValueOut(tx) {
        let ret = 0;
        for (let txOut of tx.vout) {
            ret += txOut.value;
        }
        return ret;
    }

    /**
     * CHeck whether a transaction is valid
     * @param {Transaction} tx
     */
    async checkTransaction(tx) {
        // Check coin base
        if (tx.isCoinBase()) {
            return true;
        }
        // Check budget balance and signature
        let value = 0;
        value += await this.getValueIn(tx);
        value -= this.getValueOut(tx);

        if (value < 0) {
            throw new Error("Transaction has deficit");
        }

        return true;
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
                                    ['Test Coin'], Config.BLOCK_INIT_DIFFICULTY,
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

    /**
     *  Write transaction into database
     * @param {Array<string>} data Array of tx hash value
     */
    _writeTransaction(data) {
        let txHandle = this._txdb;
        let txIdxHandle = this._txIndexdb;
        return new Promise(function (resolve, reject) {
            for (let hash of data) {
                let tx = TxPool.getInstance().findTransaction(hash);
                let txIndex = new TxIndex(tx.vout);
                Promise.all(
                    [
                        txHandle.put(hash,
                                    JSON.stringify(tx)),
                        txIdxHandle.put(hash,
                                        JSON.stringify(txIndex))
                    ]
                )
                .then(
                    () =>  resolve(TxPool.getInstance().removeByHash(hash)),
                    (err) => reject(err)
                );
            }
        })
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