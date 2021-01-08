const ENV = require('./env');
const AElf = require('aelf-sdk');
const Wallet = AElf.wallet;

let aelf = new AElf(new AElf.providers.HttpProvider(ENV.aelf.provider));
let wallet = Wallet.getWalletByPrivateKey(ENV.aelf.defaultPriKey);

async function pollMining(transactionId) {
    console.log(`>> Waiting for ${transactionId} the transaction to be mined.`);

    for (let i = 0; i < 10; i++) {
        const currentResult = await aelf.chain.getTxResult(transactionId);

        if (currentResult.Status !== 'Pending')
            return currentResult;

        await new Promise(resolve => setTimeout(resolve, 2000))
            .catch(function () {
                console.log("Promise Rejected");
            });
    }
}

async function getAirdropCount() {
    let airdropContract = await aelf.chain.contractAt(ENV.aelf.airdropContract, wallet);
    return await airdropContract.GetAirdropCount.call();
}

async function doAirdrop (ad) {
    let airdropContract = await aelf.chain.contractAt(ENV.aelf.airdropContract, wallet);
    let adTx = await airdropContract.Airdrop({
        airdrops : ad
    });

    console.log('Send Airdrop Tx: ', adTx.TransactionId);

    let txResult = await pollMining(adTx.TransactionId);

    if (txResult.Status !== 'Mined') {
        console.log(`Airdrop Tx ${adTx.TransactionId} failed.`);
        console.log(adTx);
    }
}

module.exports = {
    getAirdropCount : getAirdropCount
}
