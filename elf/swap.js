const ENV = require('../env');
const AElf = require('aelf-sdk');
const Wallet = AElf.wallet;
const AELFHelper = require('./aelf_helper');
const token = require('./token');


let aelf = new AElf(new AElf.providers.HttpProvider(ENV.aelf.provider));
let wallet = Wallet.getWalletByPrivateKey(ENV.aelf.defaultPriKey);


async function getSwapPair(swapId, symbol) {
    let swapContract = await aelf.chain.contractAt(ENV.aelf.swapContract, wallet);
    return await swapContract.GetSwapPair.call({
        swapId: swapId,
        targetTokenSymbol: symbol
    });
}

async function depositAmount(symbol) {
    let swapPair = await getSwapPair(ENV.aelf.swap.swapId, 'ELF');
    console.log(`deposit amount for ${symbol}:`, swapPair.depositAmount);
    console.log(`swapped amount for ${symbol}:`, swapPair.swappedAmount);
    return Number(swapPair.depositAmount) + Number(swapPair.swappedAmount);
}

async function deposit(symbol, amount) {
    await token.approve(ENV.aelf.swapContract, symbol, amount);
    let swapContract = await aelf.chain.contractAt(ENV.aelf.swapContract, wallet);
    let dep = await swapContract.Deposit({
        swapId: ENV.aelf.swap.swapId,
        targetTokenSymbol: symbol,
        amount: amount
    });

    await AELFHelper.pollMining(aelf, dep.TransactionId);
}

async function swapRoundCount() {
    console.log(`Try get round count..`);
    let swapPair = await getSwapPair(ENV.aelf.swap.swapId, 'ELF');
    console.log("round count:", swapPair.roundCount);
    return swapPair.roundCount;
}

async function createSwapRound(merkleTreeRoot, roundId) {
    let swapContract = await aelf.chain.contractAt(ENV.aelf.swapContract, wallet);
    let swap = await swapContract.CreateSwapRound({
        swapId: ENV.aelf.swap.swapId,
        merkleTreeRoot: merkleTreeRoot,
        roundId: roundId
    });

    await AELFHelper.pollMining(aelf, swap.TransactionId);
}

// (async () => {
//     await swapRoundCount();
//     await depositAmount('ELF');
//     await deposit('ELF', 100_000_000);
//     await depositAmount('ELF');
//     // await createSwapRound('0x9ef6cf9497dcfd47421e3ef987fd0a92b900fb809afe82786b2a213fc2379a88', 2);
// })();

module.exports = {
    getSwapRoundCount: swapRoundCount,
    getDepositAmount: depositAmount,
    deposit: deposit,
    createSwapRound: createSwapRound
}