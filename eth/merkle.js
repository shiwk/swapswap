const ENV = require('../env');
const WEB3 = require('web3');
const MERKLE = require('../build/contracts/MerkleTreeGenerator.json');

let web3 = new WEB3(ENV.eth.provider);
web3.eth.accounts.wallet.add(ENV.eth.defaultKey);
let merkleContract = new web3.eth.Contract(MERKLE.abi, ENV.eth.merkleContract);


async function receiptCountInTree(){
    console.log(`Try get receiptCountInTree..`);

    return await merkleContract.methods.receiptCountInTree().call({from: ENV.eth.defaultAddress}, function (error, result) {
        if (!error)
            console.log("receipt count in tree:", result);
    }).catch(console.log);
}

async function treeCount(){
    console.log(`Try get tree count..`);

    return await merkleContract.methods.merkleTreeCount().call({from: ENV.eth.defaultAddress}, function (error, result) {
        if (!error)
            console.log('tree count:', result);
    }).catch(console.log);
}

async function treeRoot(index){
    console.log(`Try get tree ${index} root..`);

    return await merkleContract.methods.getMerkleTreeRoot(index).call({from: ENV.eth.defaultAddress}, function (error, result) {
        if (!error)
            console.log(result);
    }).catch(console.log);
}

async function generateMerkleTree(){
    console.log(`Try generate tree ..`);

    let options = {
        from: ENV.eth.defaultAddress,
        gas: 1000000,
    }
    options.gasPrice = await web3.eth.getGasPrice() * 1.1;
    await merkleContract.methods.recordReceipts().send(options, function (error, result) {
        if (!error)
            console.log("result:", result);
    }).catch(console.log);
}

// (async () => {
//     await receiptCountInTree();
//     await treeCount();
//     await treeRoot(2);
//     // await generateMerkleTree();
// })();

module.exports ={
    getReceiptCountInTree: receiptCountInTree,
    getTreeCount: treeCount,
    getTreeRoot : treeRoot,
    generateMerkleTree : generateMerkleTree
}