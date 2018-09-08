const fs = require('fs');
const crypto = require('crypto');
const eccrypto = require('eccrypto');
const nodeUtil = require('util');

/**
 * Create a private key from scratch
 * @param {string} priKeyPath 
 * @param {string} pubKeyPath 
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
 * @param {string | Buffer | ArrayBuffer} msg The string to be signatured by ECDSA
 */
async function sig(priKeyPath, msg) {
    let hashMsg = crypto.createHash('SHA256').update(msg).digest();
    let priKey = await readFile(priKeyPath);
    
    let result = await eccrypto.sign(priKey, hashMsg);

    return result;
}

/**
 * Verify the sig of msg with publicKey in pubKeyPath
 * @param {string} pubKeyPath Directory where pubKey is stored
 * @param {string | Buffer | ArrayBuffer} msg Message to be verified
 * @param {string | Buffer | ArrayBuffer} sig Signature
 */
async function verify(pubKeyPath, msg, sig) {
    let hashMsg = crypto.createHash('SHA256').update(msg).digest();
    let pubKey = await readFile(pubKeyPath);
    return await eccrypto.verify(pubKey, hashMsg, sig);
}

/**
 * Generate Base64 address according to public key
 * @param {string | Buffer} pubKey 
 */
function generateAddress(pubKey) {
    let pubKeyHash = crypto.createHash('sha256').update(pubKey).digest();
    pubKeyHash = crypto.createHash('ripemd160').update(pubKeyHash).digest();
    let checkSum = crypto.createHash('sha256').update(pubKey).digest();
    checkSum = crypto.createHash('sha256').update(pubKey).digest();

    return  Buffer.concat([pubKeyHash, checkSum]).toString('base64');
}

module.exports = {
    createPriKey,
    sig,
    verify,
    generateAddress
}
