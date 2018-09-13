const {Transaction, TxIn, TxOut } = require('./transaction');

// TxPool singleton
let TxPool = (function (args) {
    
    function TxPool(args) {
        args = args || {};
        this._pool = new Map();
    }

    let instance;

    /**
     * Return the single instance of TxPool
     * @param {Object} args 
     * @returns {TxPool}
     */
    function getInstance(args) {
        if (!instance) {
            instance = new TxPool(args);
        }
        return instance;
    }

    function destroy() {
        instance = null;
    }

    /**
     * @returns {Transaction}
     */
    TxPool.prototype.findTransaction = function (hash) {
        return this._pool.get(hash);
    }

    /**
     * @returns {Transaction}
     */
    TxPool.prototype.pickTransaction = function (number) {
        let tx = [];
        for (let [_, value] of this._pool) {
            if (number-- > 0) {
                tx.push(value);
            }
        }
        return tx;
    }

    TxPool.prototype.pickHash = function (number) {
        let keys = [];
        for (let [key, _] of this._pool) {
            if (number-- > 0) {
                keys.push(key);
            }
        }
        return keys;
    }

    TxPool.prototype.removeByHash = function (hash) {
        this._pool.delete(hash);
    }

    TxPool.prototype.hasTransaction = function (hash) {
        return this._pool.has(hash);
    }

    TxPool.prototype.clear = function () {
        this._pool.clear();
    }

    /**
     * Delete a transaction
     * @param {Transaction} tx Transaction to deleted
     */
    TxPool.prototype.removeByTransaction = function (tx) {
        this._pool.delete(tx.getHash());
    }

    /**
     * @param {Transaction} tx 
     */
    TxPool.prototype.cacheTransaction = function (tx) {
        this._pool.set(tx.getHash(), tx);
    }

    return {
        getInstance : getInstance,
        destroy : destroy
    }
})();

module.exports = TxPool;