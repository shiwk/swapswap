const ENV = require('../env');
const WEB3 = require('web3');
const MERKLE = require('../build/contracts/MerkleTreeGenerator.json');

let web3 = new WEB3(ENV.eth.provider);
web3.eth.accounts.wallet.add(ENV.eth.defaultKey);
let merkleContract = new web3.eth.Contract(MERKLE.abi, ENV.eth.merkleContract);

async function getMerkleTree(expectCount) {
    return await merkleContract.methods.getMerkleTree(expectCount).call({from: ENV.eth.defaultAddress}, function (error, result) {
        if (!error)
            console.log(result);
    }).catch(console.log);
}

// async function generateMerkleTree(){
//     console.log(`Try generate tree ..`);
//
//     let options = {
//         from: ENV.eth.defaultAddress,
//         gas: 1000000,
//     }
//     options.gasPrice = await web3.eth.getGasPrice() * 1.1;
//     await merkleContract.methods.recordReceipts().send(options, function (error, result) {
//         if (!error)
//             console.log("result:", result);
//     }).catch(console.log);
// }

// (async () => {
//     // await receiptCountInTree();
//     // await treeCount();
//     // await treeRoot(2);
//     // await generateMerkleTree();
//     // await getMerkleTree(1024);
// })();

module.exports ={
    getMerkleTree : getMerkleTree
}