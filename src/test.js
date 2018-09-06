

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

// const readLine = require('readline');

// let rl = readLine.createInterface({
//     input : process.stdin,
//     output : process.stdout
// });

// process.stdin.on('data', (data) =>{
//     console.log('*'.repeat(2));
// })

// rl.on('line', (line) => {
//     console.log(`Received: ${line}`);
// });

const ECDSA = require('./util/ECDSA');
const Wallet = require('./wallet/wallet');
const path = require('path');
const fs = require('fs');
const util = require('util');

const wallet = new Wallet();

// ECDSA.createPriKey(wallet.priKeyPath, wallet.pubKeyPath)
// .then(
//     () => {
//         console.log("Success!");
//     },
//     (err) => {
//         console.log(err);
//     }
// );

// ECDSA.sig(wallet.priKeyPath, "Fuck you, man!!")
// .then(
//     function (data) {
//         console.log(`Sig: ${data}`);
//         return data;
//     }
// )
// .then(
//     function (data) {
//         return ECDSA.verify(wallet.pubKeyPath, "Fuck you, man!", data);
//     }
// )
// .then(
//     function () {
//         console.log(`Pass!`);
//     },
//     function (err) {
//         console.log(err);
//     }
// );

wallet.getAddress()
.then(
    (ret) => {
        console.log(`Address: ${ret}`);
    },
    (err) => {
        console.log(err);
    }
);




