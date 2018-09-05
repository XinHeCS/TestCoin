const BlockChain = require('./core/blockchain');
const Config = require('./core/coreConfig');
const Block = require('./core/block');
const Miner = require('./pow/mine');
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

let dataBase = './DataBase/chain.dat';
let blc = new BlockChain(dataBase);

tesInstance.context.Config = Config;
tesInstance.context.Block = Block;

tesInstance.context.chain = blc;
tesInstance.context.miner = new Miner(blc);



// for (let i = 0; i < 10; ++i) {
//     let block = {
//         number : i,
//         data : i + ' string.'
//     };
//     blc.addBlock(block);
// }

// let ret = blc.getBlock(Config.TOP_BLOCK);
// let ret = blc.getLatestBlock();
// let miner = new Miner(blc);

// ret.then(
//     function resolve(block) {
//         console.log('Fetch block : ' + block.number);
//         console.log('Data : ' + block.data);
//         // miner.start();
//     },
//     function reject(err) {
//         console.log(err);
//     }
// );

// let data = JSON.stringify({
//     name : 'Fuck',
//     number : '1'
// });

// db.batch()
// .put('1234', data)
// .write(function () {
//     console.log("Done!");
// });

// for (let i = 0; i < 10; ++i) {
//     db.put(i, i + ' String').then((err, ret) => { console.log(err, ret) });
// }

// db.createValueStream()
// .on('data', function (val) {
//     if (val.startsWith('5')) {
//         // value = block;
//         console.log(val);
//     }
// });

// let result = db.get("1234");

// result.then(
//     function fulfill(data) {
//         console.log(JSON.parse(data));
//     },
//     function reject(err) {
//         console.log(err);
//     }
// );

