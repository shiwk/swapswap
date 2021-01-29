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
    return await lotteryContract.GetCurrentPeriodNumber.call();
}

async function getPeriod(period) {
    let lotteryContract = await aelf.chain.contractAt(ENV.aelf.lotteryContract, wallet);
    return await lotteryContract.GetPeriod.call({
        value: period
    });
}

async function getSales(period) {
    let lotteryContract = await aelf.chain.contractAt(ENV.aelf.lotteryContract, wallet);
    return await lotteryContract.GetSales.call({
        value: period
    });
}

async function buy(amount) {
    let lotteryContract = await changeKey(ENV.aelf.lotteryContract, ENV.aelf.testPriKey);
    return await lotteryContract.Buy({
        value: amount
    });
}

async function approveLot(amount) {
    let lotteryContract = await changeKey(ENV.aelf.lotteryContract, ENV.aelf.testPriKey);
    let tokenContract = await changeKey(ENV.aelf.tokenContract, ENV.aelf.testPriKey);
    let price = await lotteryContract.GetPrice.call();
    let exceptAmount = Number(price.value) * Number(amount);
    return await tokenContract.Approve({
        symbol: "LOT",
        spender: ENV.aelf.lotteryContract,
        amount: exceptAmount
    });
}

async function setRewardListForOnePeriod(period, rewardList) {
    let lotteryContract = await aelf.chain.contractAt(ENV.aelf.lotteryContract, wallet);
    return await lotteryContract.SetRewardListForOnePeriod({
        period: period,
        rewards: rewardList
    });
}

async function prepareDraw() {
    let lotteryContract = await aelf.chain.contractAt(ENV.aelf.lotteryContract, wallet);
    return await lotteryContract.PrepareDraw();
}

async function waitDrawLag(height){
    let lotteryContract = await aelf.chain.contractAt(ENV.aelf.lotteryContract, wallet);
    let currentHeight = await aelf.chain.getBlockHeight();
    let drawingLag = await lotteryContract.GetDrawingLag.call();
    while (currentHeight < height + Number(drawingLag.value) + 16) {
        await wait(10000);
        console.log('Waiting draw lag ...');
        currentHeight = await aelf.chain.getBlockHeight();
    }
}

async function draw(period) {
    let lotteryContract = await aelf.chain.contractAt(ENV.aelf.lotteryContract, wallet);
    return await lotteryContract.Draw({
        value: period
    });
}

async function getRewardResult(period){
    let lotteryContract = await aelf.chain.contractAt(ENV.aelf.lotteryContract, wallet);
    return await lotteryContract.GetRewardResult.call({
        value: period
    });
}


module.exports = {
    getCurrentPeriodNumber: getCurrentPeriodNumber,
    getPeriod: getPeriod,
    getSales: getSales,
    buy: buy,
    setRewardListForOnePeriod: setRewardListForOnePeriod,
    prepareDraw: prepareDraw,
    draw: draw,
    approveLot: approveLot,
    waitDrawLag : waitDrawLag,
    getRewardResult : getRewardResult
}