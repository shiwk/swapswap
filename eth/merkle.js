const ENV = require('../env');
const WEB3 = require('web3');
const MERKLE = require('../build/contracts/MerkleTreeGenerator.json');

let web3 = new WEB3(ENV.eth.provider);
web3.eth.accounts.wallet.add(ENV.eth.defaultKey);
let merkleContract = new web3.eth.Contract(MERKLE.abi, ENV.eth.merkleContract);

async function getMerkleTree(expectCount) {
    return await merkleContract.methods.getMerkleTree(expectCount).call({from: ENV.eth.defaultAddress}, function (error, result) {});
}

module.exports ={
    getMerkleTree : getMerkleTree
}