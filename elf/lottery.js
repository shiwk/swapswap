const ENV = require('../env');
const AElf = require('aelf-sdk');
const Wallet = AElf.wallet;
const AELFHelper = require('./aelf_helper');

let aelf = new AElf(new AElf.providers.HttpProvider(ENV.aelf.provider));
let wallet = Wallet.getWalletByPrivateKey(ENV.aelf.defaultPriKey);

let changeKey = async function (contract, privateKey) {
    let wallet = Wallet.getWalletByPrivateKey(privateKey);
    return await aelf.chain.contractAt(contract, wallet);
}

async function wait(seconds) {
    await new Promise(resolve => setTimeout(resolve, seconds))
        .catch(function () {
            console.log("Promise Rejected");
        });
}

async function getCurrentPeriodNumber() {
    let lotteryContract = await aelf.chain.contractAt(ENV.aelf.lotteryContract, wallet);
    let currentPeriod = await lotteryContract.GetCurrentPeriodNumber.call();

    console.log(`Before draw period is ${currentPeriod.value}`);
    return currentPeriod;
}

async function getSales(period) {
    let lotteryContract = await aelf.chain.contractAt(ENV.aelf.lotteryContract, wallet);
    return await lotteryContract.GetSales.call({
        value: period
    });
}

async function buy(amount) {
    let lotteryContract = await changeKey(ENV.aelf.lotteryContract, ENV.aelf.testPriKey);
    let tokenContract = await changeKey(ENV.aelf.tokenContract, ENV.aelf.testPriKey);
    let price = await lotteryContract.GetPrice.call();
    let exceptAmount = Number(price.value) * Number(amount);
    let approveTx = await tokenContract.Approve({
        symbol: "LOT",
        spender: ENV.aelf.lotteryContract,
        amount: exceptAmount
    });
    await AELFHelper.pollMining(aelf, approveTx.TransactionId);

    let buyTx = await lotteryContract.Buy({
        value: amount
    });

    await AELFHelper.pollMining(aelf, buyTx.TransactionId);
}

async function setRewardListForOnePeriod(period, rewardList) {
    let lotteryContract = await aelf.chain.contractAt(ENV.aelf.lotteryContract, wallet);
    let setRewardTx = await lotteryContract.SetRewardListForOnePeriod({
        period: period,
        rewards: rewardList
    });
    await AELFHelper.pollMining(aelf, setRewardTx.TransactionId);
}

async function prepareDrawAndWait() {
    let lotteryContract = await aelf.chain.contractAt(ENV.aelf.lotteryContract, wallet);
    let prepareDrawTx = await lotteryContract.PrepareDraw();
    let {BlockNumber: height} = await AELFHelper.pollMining(aelf, prepareDrawTx.TransactionId);
    let currentHeight = await aelf.chain.getBlockHeight();
    let drawingLag = await lotteryContract.GetDrawingLag.call();
    while (currentHeight < height + Number(drawingLag.value) + 50) {
        await wait(10000);
        console.log('Waiting draw lag ...');
        currentHeight = await aelf.chain.getBlockHeight();
    }
    console.log("***");
}

async function draw(period) {
    let lotteryContract = await aelf.chain.contractAt(ENV.aelf.lotteryContract, wallet);
    let drawTx = await lotteryContract.Draw({
        value: period
    });

    await AELFHelper.pollMining(aelf, drawTx.TransactionId);

    let periodInfo = await lotteryContract.GetRewardResult.call({
        value: period
    });
    console.log(`*** Period ${period}`)
    for (let i = 0; i < periodInfo.rewardLotteries.length; i++) {
        console.log(` reward Id: ${periodInfo.rewardLotteries[i]["id"]}`);
    }
}

module.exports = {
    getCurrentPeriodNumber: getCurrentPeriodNumber,
    getSales: getSales,
    buy: buy,
    setRewardListForOnePeriod: setRewardListForOnePeriod,
    prepareDraw: prepareDrawAndWait,
    draw: draw
}