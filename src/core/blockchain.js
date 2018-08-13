const SHA256 = require('../util/SHA256');

class Block {
    constructor (number, preHash, data, difficulty, nonce) {
        this.number = number;
        this.preHash = preHash;
        this.data = data;
        this.timeStamp = new Date().getTime();
        this.difficulty = difficulty;
        this.nonce = null;
    }
}

let blockChain = [
    new Block(0, 0, [1, 2, 3], 16, null)
];

function getLatestBlock() {
    return blockChain[blockChain.length - 1];
}

function getBlock(number) {
    try {
        return blockChain[number];
    } catch (error) {
        console.error(error);
        return undefined;
    }
}

/**
 * Calculate the hash of some certain block
 * using sha256 algorithm
 * @param {Block} block The block to be hashed
 * @returns {string} A hex-fy hash string
 */
function generateBlockHash(block) {    
    let val = block.number + block.preHash + block.timeStamp 
    + block.data + block.difficulty + block.nonce;

    return SHA256(val);
}

/**
 * Generate a new un-minded block added to the top of block chain
 * @param {any} data Current block data
 * @returns {Block} The new block
 */
function generateNewBlock(data) {
    const topBlock = getLatestBlock();
    const preHash = generateBlockHash(topBlock);

    return new Block(topBlock.number + 1, preHash, data, 
        topBlock.difficulty);
}

/**
 * To verify if the block is legal
 * @param {Block} block The block to be verified
 * @returns {boolean} whether this block is valid
 */
function isValidBlock(block) {
    const preBLock = getBlock(block.number - 1);

    if (preBLock !== undefined) {
        if (preBLock.hash !== block.preHash) {
            console.error('Unmatched previous hash!');
            return false;
        }
        else if (block.hash !== generateBlockHash(block)) {
            console.error('Unmatched block hash!');
            return false;
        }
        // TODO : Should also check if the data is valid here
        return true;
    }

    return false;
}

/**
 * Add new block into the block chain
 * @param {Block} block The new block to be added into the block chain
 */
function addBlock(block) {
    blockChain.push(block);
}

module.exports = {
    Block,
    getLatestBlock,
    getBlock,
    generateNewBlock,
    isValidBlock,
    addBlock
};
