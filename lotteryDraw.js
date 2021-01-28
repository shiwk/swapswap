const lottery = require('./elf/lottery');
const ENV = require('./env');
const rewardInfo = require('./rewardList.json')

async function getCurrentPeriodNumber() {
    return await lottery.getCurrentPeriodNumber().catch(console.log);
}

async function getSales(period) {
    return await lottery.getSales(period).catch(console.log);
}

async function buy(amount) {
    return await lottery.buy(amount).catch(console.log);
}

async function setRewardListForOnePeriod(period,rewardList) {
    return await lottery.setRewardListForOnePeriod(period,rewardList).catch(console.log);
}

async function prepareDrawAndWait() {
    return await lottery.prepareDraw().catch(console.log);
}

async function draw(period) {
    return await lottery.draw(period).catch(console.log);
}

function getRewardList() {
    let info = rewardInfo.lists;
    let rewardList = [];
    // let drawPeriod = info[period -1].period;
    for (let i =0; i<info.length;i++)
        rewardList[info[i].period] = info[i].rewards
    return rewardList;
}

(async () => {
    let currentPeriod = await getCurrentPeriodNumber();
    let allRewardList = getRewardList();
    let rewards = allRewardList[currentPeriod.value];
    let count = Object.values(rewards);
    let rewardCount =0;
    count.forEach(function(val) {
        rewardCount += val;
    }, 0);

    let sales = await getSales(currentPeriod.value);
    sales = sales ? sales.value : 0;
    if (sales < rewardCount){
        console.log('Need buy lottery...')
        let amount = rewardCount - sales;
        await buy(amount);
    }

    await setRewardListForOnePeriod(currentPeriod.value,rewards);
    await prepareDrawAndWait();
    await draw(currentPeriod.value);
    console.log('Done.')
})();
