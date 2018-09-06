const fs = require('fs');
const crypto = require('crypto');
const eccrypto = require('eccrypto');
const nodeUtil = require('util');

/**
 * Create a private key from scratch
 * @param {string} priKeyPath 
 * @param {*} pubKeyPath 
 */
async function createPriKey(priKeyPath, pubKeyPath) {
    // A new random 32-byte private key.
    let privateKey = crypto.randomBytes(32);
    // Corresponding uncompressed (65-byte) public key.
    let publicKey = eccrypto.getPublic(privateKey);

    await writeFile(priKeyPath, privateKey);
    await writeFile(pubKeyPath, publicKey);
}

/**
 * Signature the string with current unlocked account
 * @param {string} priKeyPath Directory where priKey is stored
 * @param {string} str The string to be signatured by ECDSA
 */
async function sig(priKeyPath, str) {
    let hashMsg = crypto.createHash('SHA256').update(str).digest();
    let priKey = await readFile(priKeyPath);
    
    let result = await eccrypto.sign(priKey, hashMsg);

    return result;
}

/**
 * Verify the sig of msg with publicKey in pubKeyPath
 * @param {string} pubKeyPath Directory where pubKey is stored
 * @param {string} msg Message to be verified
 * @param {string} sig Signature
 */
async function verify(pubKeyPath, msg, sig) {
    let hashMsg = crypto.createHash('SHA256').update(msg).digest();
    let pubKey = await readFile(pubKeyPath);
    return await eccrypto.verify(pubKey, hashMsg, sig);
}

module.exports = {
    createPriKey,
    sig,
    verify
}
