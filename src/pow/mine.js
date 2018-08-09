const bc = require('../core/blockchain');
const config = require('../core/coreConfig');
import {SHA256} from '../util/SHA256';

class Miner {
    /**
     * Solve the puzzle with this block
     * @param {Block} block The block to be minded
     */
    solve(block) {
        if (block.nonce === null) {
            let nonce = 0;
            do {
                let answer = SHA256(block.hash + nonce);
                ++nonce;
            } while (!this.matchDifficulty(answer, block.difficulty));

            block.nonce = nonce;
        }
        
        return block;
    }

    /**
     * Check if this hash value matches the difficulty 
     * @param {string} hash hash value to be verified
     * @param {number} difficulty Current difficulty
     */
    matchDifficulty(hash, difficulty) {
        let answer = parseInt(hash, 16).toString(2);
        let pattern = '0'.repeat(difficulty);

        return answer.startsWith(pattern);
    }
}