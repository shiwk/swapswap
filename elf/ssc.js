const ENV = require('../env');
const AElf = require('aelf-sdk');
const Wallet = AElf.wallet;
const AELFHelper = require('./aelf_helper');

let aelf = new AElf(new AElf.providers.HttpProvider(ENV.aelf.provider));
let wallet = Wallet.getWalletByPrivateKey(ENV.aelf.defaultPriKey);

async function GetCurrentPeriod(){
    let sscContract = await aelf.chain.contractAt(ENV.aelf.sscContract, wallet);
    let currentPeriod =  await sscContract.GetCurrentPeriod.call();

    console.log(`Current period is ${currentPeriod.periodNumber}`);
    return currentPeriod;
}

async function GetLatestDrawPeriod(){
    let sscContract = await aelf.chain.contractAt(ENV.aelf.sscContract, wallet);
    return await sscContract.GetLatestDrawPeriod.call();
}

async function PrepareDraw(){
    let sscContract = await aelf.chain.contractAt(ENV.aelf.sscContract, wallet);
    let prepareDrawTx = await sscContract.PrepareDraw();
    await AELFHelper.pollMining(aelf,prepareDrawTx.TransactionId);
}

async function Draw(period){
    let sscContract = await aelf.chain.contractAt(ENV.aelf.sscContract, wallet);
    let drawTx = await sscContract.Draw({
        value: period
    });

    await AELFHelper.pollMining(aelf,drawTx.TransactionId);

    let periodInfo = await sscContract.GetPeriod.call({
        value: period
    });
    console.log(`*** Period ${period} LuckNumber: ${periodInfo.luckyNumber}; DrawBlockNumber: ${periodInfo.drawBlockNumber}`)
}

module.exports = {
    getCurrentPeriod: GetCurrentPeriod,
    getLatestDrawPeriod: GetLatestDrawPeriod,
    prepareDraw: PrepareDraw,
    draw: Draw
}