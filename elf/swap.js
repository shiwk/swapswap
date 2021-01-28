const ENV = require('../env');
const AElf = require('aelf-sdk');
const Wallet = AElf.wallet;

let aelf = new AElf(new AElf.providers.HttpProvider(ENV.aelf.provider));
let wallet = Wallet.getWalletByPrivateKey(ENV.aelf.defaultPriKey);


async function swapPair(symbol) {
    let swapContract = await aelf.chain.contractAt(ENV.aelf.swapContract, wallet);
    return await swapContract.GetSwapPair.call({
        swapId: ENV.aelf.swap.swapId,
        targetTokenSymbol: symbol
    });
}

async function deposit(symbol, amount) {
    let swapContract = await aelf.chain.contractAt(ENV.aelf.swapContract, wallet);
    return await swapContract.Deposit({
        swapId: ENV.aelf.swap.swapId,
        targetTokenSymbol: symbol,
        amount: amount
    });
}

module.exports = {
    getSwapPair: swapPair,
    deposit: deposit,
}