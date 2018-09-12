// const {Transaction, TxIn, TxOut, TxIndex} = require('./Transaction/transaction');
const ECDSA = require('./util/ECDSA');
const Account = require('./wallet/account');
const BlockChain = require('./core/blockchain');
const Config = require('./core/coreConfig');
const Miner = require('./pow/mine');
const path = require('path');
const fs = require('fs');
const util = require('util');

const chain = new BlockChain(Config.CHAIN_DATABASE,
                             Config.TX_DATABASE,
                             Config.TX_INDEX_DATABASE);

const account = new Account(chain);

account.getAddress()
.then((addr) => console.log(addr));

// chain.getTxByHash('bab99a1d8e05ef89819e3a271bd4cf2ff3ee1437c61d3e3df0eab0adf09fb052')
// .then(
//     (data) => console.log(data)
// );

account.createTransaction(null, [null], [5])
.then(
    (data) => console.log(data)
);

// account.createAccount('./KeyStore');
account.refreshBalance()
.then(
    (data) => console.log(`You have ${data} tc`),
    (err) => console.log(err)
);


// const miner = new Miner(chain, account);

// miner.start();

// let {a, b, c} = {a : 1, b : 2, c : 3};

// let test = () => console.log(a, b, c);
// test.func = () => console.log(a + b + c);

// test.func();

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

// account.getAddress()
// .then(
//     (ret) => {
//         console.log(`Address: ${ret}`);
//     },
//     (err) => {
//         console.log(err);
//     }
// );
// let arr = []

// function use() {
//     return new Promise(function (resolve, reject) {
//         setTimeout(() => {
//             arr.push(1, 2, 3);
//             resolve(13);
//         }, 2000);
//     });
// }

// async function func() {
//     await use();
// }

// async function test(condition) {
//     // if (condition) {
//     //     throw new Error("Fuck");
//     // }
//     // else {
//     //     return 123;
//     // }
//     console.log(arr);

//     await func();

//     console.log(arr);
// }

// test(true)
// .then(
//     (data) => console.log(data),
//     (err) => console.log(err)
// );
