// const Miner = require('./pow/mine');

// let miner = new Miner();

// miner.start();
// let nums = [1, 1, 2];
// let curVal = nums[0];
// for (let i = 1; i < nums.length; ++i) {
//     if (curVal !== nums[i]) {
//         curVal = nums[i];
//     }
//     else {
//         nums.pop(i);
//     }
// }

// return nums.length;
const BlockChain = require('./core/blockchain');
// const Config = require('./core/coreConfig');

let dataBase = './DataBase/chain.dat';
let blc = new BlockChain(dataBase);

// for (let i = 0; i < 10; ++i) {
//     let block = {
//         number : i,
//         data : i + ' string.'
//     };
//     blc.addBlock(block);
// }

// let ret = blc.getBlock(Config.TOP_BLOCK);
let ret = blc.getLatestBlock();

ret.then(
    function resolve(block) {
        console.log('Fetch block : ' + block.number);
        console.log('Data : ' + block.data);
    },
    function reject(err) {  
        console.log(err);
    }
);

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

