class Block {
    constructor (number, preHash, data) {
        this.number = number;
        this.preHash = preHash;
        this.data = data;
        this.timeStamp = new Date().getTime();
    }
}