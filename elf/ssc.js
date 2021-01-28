const ENV = require('../env');
const AElf = require('aelf-sdk');
const Wallet = AElf.wallet;
const AELFHelper = require('./aelf_helper');

let aelf = new AElf(new AElf.providers.HttpProvider(ENV.aelf.provider));
let wallet = Wallet.getWalletByPrivateKey(ENV.aelf.defaultPriKey);

async function getCurrentPeriod() {
    let sscContract = await aelf.chain.contractAt(ENV.aelf.sscContract, wallet);
    let currentPeriod = await sscContract.GetCurrentPeriod.call();

    return currentPeriod;
}

async function getLatestDrawPeriod() {
    let sscContract = await aelf.chain.contractAt(ENV.aelf.sscContract, wallet);
    return await sscContract.GetLatestDrawPeriod.call();
}

async function getPeriod(period){
    return await sscContract.GetPeriod.call({
        value: period
    });
}

async function prepareDraw() {
    let sscContract = await aelf.chain.contractAt(ENV.aelf.sscContract, wallet);
    let prepareDrawTx = await sscContract.PrepareDraw();
    await AELFHelper.pollMining(aelf, prepareDrawTx.TransactionId);
}

async function draw(period) {
    let sscContract = await aelf.chain.contractAt(ENV.aelf.sscContract, wallet);
    let drawTx = await sscContract.Draw({
        value: period
    });

    await AELFHelper.pollMining(aelf, drawTx.TransactionId);
}

module.exports = {
    getCurrentPeriod: getCurrentPeriod,
    getLatestDrawPeriod: getLatestDrawPeriod,
    prepareDraw: prepareDraw,
    draw: draw,
    getPeriod: getPeriod
}