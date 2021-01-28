const ssc = require('./elf/ssc');
const log = require('./logger');

const logger = log.createLogger('logs/sscDraw');

async function getCurrentPeriodNumber() {
    let currentPeriod = await ssc.getCurrentPeriod().catch(err => {
        logger.error(err.stack);
        throw err;
    });
    logger.info(`Current period is ${currentPeriod}`);
    return Number(currentPeriod.periodNumber);
}

async function getLatestDrawPeriodNumber() {
    let lastDrawPeriod = await ssc.getLatestDrawPeriod().catch(err => {
        logger.error(err.stack);
        throw err;
    });

    logger.info(`lastDrawPeriod: ${lastDrawPeriod.number}`);
    return Number(lastDrawPeriod.periodNumber);
}

async function prepareDraw() {
    logger.info("prepare draw..");
    return await ssc.prepareDraw().catch(err => {
        logger.error(err.stack);
        throw err;
    });
}

async function draw(period) {
    logger.info("draw..");
    await ssc.draw(period).catch(err => {
        logger.error(err.stack);
        throw err;
    });

    let periodInfo = await ssc.getPeriod(period).catch(err => {
        logger.error(err.stack);
        throw err;
    });
    logger.info(`Period ${period} LuckNumber: ${periodInfo.luckyNumber}; DrawBlockNumber: ${periodInfo.drawBlockNumber}`);
}

(async () => {
    let latestPeriodNumber = await getLatestDrawPeriodNumber();
    let currentPeriodNumber = await getCurrentPeriodNumber();
    await prepareDraw();
    let period = currentPeriodNumber === 1 ? 1 : latestPeriodNumber + 1;
    await draw(period);
    logger.info('Done.');
})();