const path = require('path');

// Core config
const BLOCK_GEN_SPEED = 10000;
const BLOCK_CHECK_INTERVAL = 10;
const BLOCK_INIT_DIFFICULTY = 20;
const TOP_BLOCK = "_top_block";

// Date base path config
const DATABASE = './DataBase';
const TX_DATABASE = path.resolve(DATABASE, 'tx.dat');
const CHAIN_DATABASE = path.resolve(DATABASE, 'chain.dat');
const TX_INDEX_DATABASE = path.resolve(DATABASE, 'tx_index.dat');

module.exports = {
    BLOCK_INIT_DIFFICULTY,
    BLOCK_CHECK_INTERVAL,
    BLOCK_GEN_SPEED,
    TOP_BLOCK,
    CHAIN_DATABASE,
    TX_DATABASE,
    TX_INDEX_DATABASE
}