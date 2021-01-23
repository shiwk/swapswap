const ENV = require('../env');
const AElf = require('aelf-sdk');
const Wallet = AElf.wallet;
const ELFHelper = require('./elf_helper');

let aelf = new AElf(new AElf.providers.HttpProvider(ENV.aelf.provider));
let wallet = Wallet.getWalletByPrivateKey(ENV.aelf.defaultPriKey);

async function balanceOf(address, symbol){
    let tokenContract = await aelf.chain.contractAt(ENV.aelf.tokenContract, wallet);
    let balance =  await tokenContract.GetBalance.call({
        symbol: symbol,
        owner: address
    });

    console.log(`balance of ${address}:`,balance.balance);
}

async function transfer(to, symbol, amount){
    let tokenContract = await aelf.chain.contractAt(ENV.aelf.tokenContract, wallet);
    let transferTx = await tokenContract.Transfer({
        symbol: symbol,
        to: to,
        amount: amount
    });

    await ELFHelper.pollMining(aelf, transferTx.TransactionId);
}

async function approve(spender, symbol, amount){
    let tokenContract = await aelf.chain.contractAt(ENV.aelf.tokenContract, wallet);
    let approveTx = await tokenContract.Approve({
        symbol: symbol,
        spender: spender,
        amount: amount
    });

    await ELFHelper.pollMining(aelf, approveTx.TransactionId);
}

// (async () => {
//     await balanceOf(ENV.aelf.defaultAddress, 'LOT');
//     await transfer('28Y8JA1i2cN6oHvdv7EraXJr9a1gY6D1PpJXw9QtRMRwKcBQMK', 'LOT', 1_000_000_000);
//     await balanceOf(ENV.aelf.defaultAddress, 'LOT');
// })();

module.exports = {
    transfer : transfer,
    approve: approve
}