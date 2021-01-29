const lottery = require('./elf/lottery');
const rewardInfo = require('./rewardList.json')
const log = require('./logger');
const AELFHelper = require('./elf/aelf_helper');

const logger = log.createLogger('logs/lottery');

async function getCurrentPeriodNumber() {
    let currentPeriod = await lottery.getCurrentPeriodNumber().catch(err => {
        logger.error(err.stack);
        throw err;
    });
    logger.info(`Before draw period is ${currentPeriod.value}`);
    return Number(currentPeriod.value);
}

async function isPeriodDrawn(period) {
    let periodInfo = await lottery.getPeriod(period).catch(err => {
        logger.error(err.stack);
        throw err;
    });
    return periodInfo.randomHash !== '0000000000000000000000000000000000000000000000000000000000000000';
}

async function getSales(period) {
    return await lottery.getSales(period).catch(err => {
        logger.error(err.stack);
        throw err;
    });
}

async function buy(amount) {
    let tx = await lottery.approveLot(amount).catch(err => {
        logger.error(err.stack);
        throw err;
    });
    await AELFHelper.pollMining(tx.TransactionId, logger).catch(err => {
        logger.error(err.stack ? err.stack : err);
        throw err;
    });

    let buy = await lottery.buy(amount).catch(err => {
        logger.error(err.stack);
        throw err;
    });
    await AELFHelper.pollMining(buy.TransactionId, logger).catch(err => {
        logger.error(err.stack ? err.stack : err);
        throw err;
    });
}

async function setRewardListForOnePeriod(period, rewardList) {
    let tx = await lottery.setRewardListForOnePeriod(period, rewardList).catch(err => {
        logger.error(err.stack);
        throw err;
    });
    await AELFHelper.pollMining(tx.TransactionId, logger).catch(err => {
        logger.error(err.stack ? err.stack : err);
        throw err;
    });
}

async function prepareDraw() {
    let tx = await lottery.prepareDraw().catch(err => {
        logger.error(err.stack);
        throw err;
    });
    let {BlockNumber: height} = await AELFHelper.pollMining(tx.TransactionId, logger).catch(err => {
        logger.error(err.stack ? err.stack : err);
        throw err;
    });

    return height;
}

async function waitDrawLag(height) {
    await lottery.waitDrawLag(height);
}

async function draw(period) {
    let tx = await lottery.draw(period).catch(err => {
        logger.error(err.stack);
        throw err;
    });
    await AELFHelper.pollMining(tx.TransactionId, logger).catch(err => {
        logger.error(err.stack ? err.stack : err);
        throw err;
    });

    await getRewardResult(period);
}

async function getRewardResult(period) {
    let periodInfo = await lottery.getRewardResult(period).catch(err => {
        logger.error(err.stack);
        throw err;
    });
    logger.info(`*** Period ${period}`)
    for (let i = 0; i < periodInfo.rewardLotteries.length; i++) {
        logger.info(` reward Id: ${periodInfo.rewardLotteries[i]["id"]}`);
    }
}

function getRewardList() {
    let info = rewardInfo.lists;
    let rewardList = [];
    for (let i = 0; i < info.length; i++)
        rewardList[info[i].period] = info[i].rewards
    return rewardList;
}

(async () => {
    let currentPeriod = await getCurrentPeriodNumber();

    if (currentPeriod === 1 || await isPeriodDrawn(currentPeriod - 1)) {
        let allRewardList = getRewardList();
        let rewards = allRewardList[currentPeriod];
        let count = Object.values(rewards);
        let rewardCount = 0;
        count.forEach(function (val) {
            rewardCount += val;
        }, 0);

        let sales = await getSales(currentPeriod);
        sales = sales ? sales.value : 0;
        if (sales < rewardCount) {
            logger.info('Need buy lottery...')
            let amount = rewardCount - sales;
            await buy(amount);
        }

        await setRewardListForOnePeriod(currentPeriod, rewards);
        let height = await prepareDraw();
        await waitDrawLag(height);
    }
    await draw(currentPeriod);
    logger.info('Done.');
})();
