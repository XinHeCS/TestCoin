const BlockChain = require('./src/core/blockchain');
const Account = require('./src/wallet/account');
const Config = require('./src/core/coreConfig');
const Block = require('./src/core/block');
const Miner = require('./src/pow/mine');
const testCoin = require('repl');
const vm = require('vm');

function testEval(cmd, content, filename, callback) {
    let result;
    try {
        result = vm.runInContext(cmd, content);
    } catch (error) {
        if (isRecoverableError(error)) {
            return callback(new repl.Recoverable(error));
        }
        else {
            callback(error);
        }
    }

    if (result instanceof Promise) {
        result.then(
            function fulfill(data) {
                callback(null, data);
            },
            function reject(err) {
                callback(err);
            }
        );
    }
    else {
        callback(null, result);
    }
}
  
function isRecoverableError(error) {
    if (error.name === 'SyntaxError') {
        return /^(Unexpected end of input|Unexpected token)/.test(error.message);
    }
    return false;
}

let tesInstance = testCoin.start({
    prompt : '-> ',
    eval : testEval
});

const chain = new BlockChain(Config.CHAIN_DATABASE,
                            Config.TX_DATABASE,
                            Config.TX_INDEX_DATABASE);

const account = new Account(chain);

const miner = new Miner(chain, account);

tesInstance.context.Config = Config;
tesInstance.context.Block = Block;
tesInstance.context.account = account;
tesInstance.context.chain = chain;
tesInstance.context.miner = miner;