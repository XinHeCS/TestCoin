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


// account.createAccount('./KeyStore');
account.showBalance()
.then(
    (data) => console.log(`You have ${data} tc`),
    (err) => console.log(err)
);

const miner = new Miner(chain, account);

miner.start();

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

// async function test(condition) {
//     if (condition) {
//         throw new Error("Fuck");
//     }
//     else {
//         return 123;
//     }
// }

// test(true)
// .then(
//     () => console.log('true!'),
//     () => console.log('false!')
// );






