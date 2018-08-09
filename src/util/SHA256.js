const crypto = require('crypto');

/**
 * Return the SHA256 hash of data
 * @param {string} data The string data to be hashed
 */
function SHA256(data) {
    const hash = crypto.createHash('sha256');
    hash.update(data);

    return '0x' + hash.digest('hex');
}


module.exports = {
    SHA256
}