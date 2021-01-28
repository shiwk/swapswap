const ENV = require('../env');
const AElf = require('aelf-sdk');
const Wallet = AElf.wallet;

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
    console.log(`Transfer ${amount} ${symbol} to ${to}.`);
    let tokenContract = await aelf.chain.contractAt(ENV.aelf.tokenContract, wallet);
    return await tokenContract.Transfer({
        symbol: symbol,
        to: to,
        amount: amount
    });
}

async function approve(spender, symbol, amount){
    console.log(`Approve ${amount} ${symbol} to ${spender}.`);
    let tokenContract = await aelf.chain.contractAt(ENV.aelf.tokenContract, wallet);
    return await tokenContract.Approve({
        symbol: symbol,
        spender: spender,
        amount: amount
    });
}

module.exports = {
    transfer : transfer,
    approve: approve
}