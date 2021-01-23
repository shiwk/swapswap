const ENV = require('./env');
const AElf = require('aelf-sdk');
const Wallet = AElf.wallet;
const {sha256} = AElf.utils;

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
    let chainStatus = await aelf.chain.getChainStatus({sync: true});
    console.log('chain status:');
    console.log(chainStatus);
    let airdropContract = await aelf.chain.contractAt(ENV.aelf.airdropContract, wallet);
    let count = await airdropContract.GetAirdropCount.call();

    // console.log(count.value);

    let methodFee = await airdropContract.GetMethodFee.call({
        value : 'Initialize'
    });

    console.log(methodFee);
    await tokenInfo();
    return count;
}


const tokenInfo = async() =>{
    const symbol = 'ELF';
    const chainStatus = await aelf.chain.getChainStatus({sync: true});
    const genesisContract = await aelf.chain.contractAt(chainStatus.GenesisContractAddress, wallet)
        .catch((err) => {
            console.log(err);
        });

    // get the addresses of the contracts that we'll need to call
    let tokenContractName = 'AElf.ContractNames.Token';
    const tokenContractAddress = await genesisContract.GetContractAddressByName.call(sha256(tokenContractName));
    const tokenContract = await aelf.chain.contractAt(tokenContractAddress, wallet);
    // const tokenInfo = await tokenContract.GetTokenInfo.call({
    //     symbol: symbol
    // });

    let tokenInfo = await tokenContract.GetNativeTokenInfo.call();

    let methodFee = await tokenContract.GetMethodFee.call({
        value : 'Transfer'
    });

    console.log(methodFee);

    console.log(tokenInfo);
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
