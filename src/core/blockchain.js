import {SHA256} from '../util/SHA256';

class Block {
    constructor (number, preHash, data, difficulty, nonce) {
        this.number = number;
        this.preHash = preHash;
        this.data = data;
        this.timeStamp = new Date().getTime();
        this.hash = generateBlockHash(this);
        this.difficulty = difficulty;
        this.nonce = nonce;
    }
}

let blockChain = [
    new Block(0, '', [1, 2, 3])
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
    + block.data + block.difficulty;

    return SHA256(val);
}

/**
 * Generate a new un-minded block added to the top of block chain
 * @param {any} data Current block data
 * @returns {Block} The new block
 */
function generateNewBlock(data) {
    const topBlock = getLatestBlock();

    return new Block(topBlock.number + 1, topBlock.hash, data, 
        topBlock.difficulty, null);
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

module.exports = {
    Block,
    getLatestBlock,
    getBlock,
    generateNewBlock,
    isValidBlock
};
