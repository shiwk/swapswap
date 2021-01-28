const ENV = require('../env');
const AElf = require('aelf-sdk');
const Wallet = AElf.wallet;
const AELFHelper = require('./aelf_helper');

let aelf = new AElf(new AElf.providers.HttpProvider(ENV.aelf.provider));
let wallet = Wallet.getWalletByPrivateKey(ENV.aelf.defaultPriKey);


async function recordMerkleTree(lastLeafIndex, merkleTreeRoot) {
    let merkleTreeRecorderContract = await aelf.chain.contractAt(ENV.aelf.merkleTreeRecorderContract, wallet);
    let recordMerkleTree = await merkleTreeRecorderContract.RecordMerkleTree({
        recorderId: ENV.aelf.record.recorderId,
        lastLeafIndex: lastLeafIndex,
        merkleTreeRoot: merkleTreeRoot
    });

    await AELFHelper.pollMining(aelf, recordMerkleTree.TransactionId);
}

async function getLastRecordedLeafIndex() {
    let merkleTreeRecorderContract = await aelf.chain.contractAt(ENV.aelf.merkleTreeRecorderContract, wallet);
    let lastRecordedLeafIndex = await merkleTreeRecorderContract.GetLastRecordedLeafIndex.call({
        recorderId: ENV.aelf.record.recorderId
    });

    return lastRecordedLeafIndex.value;
}

async function getSatisfiedTreeCount() {
    let merkleTreeRecorderContract = await aelf.chain.contractAt(ENV.aelf.merkleTreeRecorderContract, wallet);
    let satisfiedTreeCount = await merkleTreeRecorderContract.GetSatisfiedTreeCount.call({
        recorderId: ENV.aelf.record.recorderId
    });


    return satisfiedTreeCount ? satisfiedTreeCount.value : 0;
}


// (async () => {
//     let lastRecordedLeafIndex = await getLastRecordedLeafIndex();
//     let satisfiedTreeCount = await getSatisfiedTreeCount();
//     // await RecordMerkleTree ();
// })();

module.exports = {
    getLastRecordedLeafIndex: getLastRecordedLeafIndex,
    getSatisfiedTreeCount: getSatisfiedTreeCount,
    recordMerkleTree : recordMerkleTree
}