const ENV = require('../env');
const AElf = require('aelf-sdk');
const Wallet = AElf.wallet;

let aelf = new AElf(new AElf.providers.HttpProvider(ENV.aelf.provider));
let wallet = Wallet.getWalletByPrivateKey(ENV.aelf.defaultPriKey);

async function getCurrentPeriod() {
    let sscContract = await aelf.chain.contractAt(ENV.aelf.sscContract, wallet);
    return await sscContract.GetCurrentPeriod.call();
}

async function getLatestDrawPeriod() {
    let sscContract = await aelf.chain.contractAt(ENV.aelf.sscContract, wallet);
    return await sscContract.GetLatestDrawPeriod.call();
}

async function getPeriod(period){
    let sscContract = await aelf.chain.contractAt(ENV.aelf.sscContract, wallet);
    return await sscContract.GetPeriod.call({
        value: period
    });
}

async function prepareDraw() {
    let sscContract = await aelf.chain.contractAt(ENV.aelf.sscContract, wallet);
    return await sscContract.PrepareDraw();
}

async function draw(period) {
    let sscContract = await aelf.chain.contractAt(ENV.aelf.sscContract, wallet);
    return await sscContract.Draw({
        value: period
    });
}

module.exports = {
    getCurrentPeriod: getCurrentPeriod,
    getLatestDrawPeriod: getLatestDrawPeriod,
    prepareDraw: prepareDraw,
    draw: draw,
    getPeriod: getPeriod
}