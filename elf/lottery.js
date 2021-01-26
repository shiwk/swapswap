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

async function GetCurrentPeriodNumber() {
    let lotteryContract = await aelf.chain.contractAt(ENV.aelf.lotteryContract, wallet);
    let currentPeriod = await lotteryContract.GetCurrentPeriodNumber.call();

    console.log(`Before draw period is ${currentPeriod.value}`);
    return currentPeriod;
}

async function GetSales(period){
    let lotteryContract = await aelf.chain.contractAt(ENV.aelf.lotteryContract, wallet);
    let sales = await lotteryContract.GetSales.call({
        value: period
    });
    return sales;
}

async function GetPrice(){
    let lotteryContract = await aelf.chain.contractAt(ENV.aelf.lotteryContract, wallet);
    return await lotteryContract.GetPrice.call();
}

async function Buy(amount){
    let lotteryContract = await changeKey(ENV.aelf.lotteryContract,ENV.aelf.testPriKey);
    let tokenContract = await changeKey(ENV.aelf.tokenContract,ENV.aelf.testPriKey);
    let price = await GetPrice();
    let exceptAmount = Number(price.value) * Number(amount);
    let approveTx = await tokenContract.Approve({
        symbol:"LOT",
        spender: ENV.aelf.lotteryContract,
        amount: exceptAmount
    });
    await AELFHelper.pollMining(aelf, approveTx.TransactionId);

    let buyTx = await lotteryContract.Buy({
        value: amount
    });

    await AELFHelper.pollMining(aelf, buyTx.TransactionId);
}

async function SetRewardListForOnePeriod(period, rewardList) {
    let lotteryContract = await aelf.chain.contractAt(ENV.aelf.lotteryContract, wallet);
    let setRewardTx = await lotteryContract.SetRewardListForOnePeriod({
        period: period,
        rewards: rewardList
    });
    await AELFHelper.pollMining(aelf, setRewardTx.TransactionId);
}

async function PrepareDrawAndWait() {
    let lotteryContract = await aelf.chain.contractAt(ENV.aelf.lotteryContract, wallet);
    let prepareDrawTx = await lotteryContract.PrepareDraw();
    let {BlockNumber: height} = await AELFHelper.pollMining(aelf, prepareDrawTx.TransactionId);
    let currentHeight = await aelf.chain.getBlockHeight();
    let drawingLag = await GetDrawingLag();
    while (currentHeight < height + Number(drawingLag.value)) {
        await wait(10000);
        console.log('Waiting block ...');
        currentHeight = await aelf.chain.getBlockHeight();
    }
    console.log("***");
}

async function Draw(period) {
    let lotteryContract = await aelf.chain.contractAt(ENV.aelf.lotteryContract, wallet);
    let drawTx = await lotteryContract.Draw({
        value: period
    });

    await AELFHelper.pollMining(aelf, drawTx.TransactionId);

    let periodInfo = await lotteryContract.GetRewardResult.call({
        value: period
    });
    console.log(`*** Period ${period}`)
    for (let i =0; i< periodInfo.rewardLotteries.length; i++)
    {
        console.log(` reward Id: ${periodInfo.rewardLotteries[i]["id"]}`);
    }
}

async function GetDrawingLag() {
    let lotteryContract = await aelf.chain.contractAt(ENV.aelf.lotteryContract, wallet);
    return await lotteryContract.GetDrawingLag.call();
}

module.exports = {
    getCurrentPeriodNumber: GetCurrentPeriodNumber,
    getSales:GetSales,
    buy:Buy,
    setRewardListForOnePeriod: SetRewardListForOnePeriod,
    prepareDraw: PrepareDrawAndWait,
    draw: Draw
}