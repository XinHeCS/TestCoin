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

    TxPool.prototype.findTransaction = function (hash) {
        return this._pool.get(hash);
    }

    TxPool.prototype.pickTransaction = function () {
        for (let [key, value] of this) {
            let ret = value;
            this._pool.delete(key);
            return ret;
        }
        return undefined;
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
    TxPool.prototype.deleteTransaction = function (tx) {
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