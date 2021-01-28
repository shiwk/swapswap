const ssc = require('./elf/ssc');
const log = require('./logger');
const AELFHelper = require('./elf/aelf_helper');
const logger = log.createLogger('logs/sscDraw');

async function getCurrentPeriodNumber() {
    let currentPeriod = await ssc.getCurrentPeriod().catch(err => {
        logger.error(err.stack);
        throw err;
    });
    logger.info(`Current period is ${currentPeriod.toString()}`);
    return Number(currentPeriod.periodNumber);
}

async function getLatestDrawPeriodNumber() {
    let lastDrawPeriod = await ssc.getLatestDrawPeriod().catch(err => {
        logger.error(err.stack);
        throw err;
    });

    logger.info(`lastDrawPeriod: ${lastDrawPeriod.periodNumber}`);
    return Number(lastDrawPeriod.periodNumber);
}

async function prepareDraw() {
    logger.info("prepare draw..");
    let tx = await ssc.prepareDraw().catch(err => {
        logger.error(err.stack);
        throw err;
    });

    await AELFHelper.pollMining(tx.TransactionId, logger);
}

async function draw(period) {
    logger.info("draw..");
    let tx = await ssc.draw(period).catch(err => {
        logger.error(err.stack);
        throw err;
    });
    await AELFHelper.pollMining(tx.TransactionId, logger);

    let periodInfo = await ssc.getPeriod(period).catch(err => {
        logger.error(err.stack);
        throw err;
    });
    logger.info(`Period ${period} LuckNumber: ${periodInfo.luckyNumber}; DrawBlockNumber: ${periodInfo.drawBlockNumber}`);
}

(async () => {
    await prepareDraw();
    let currentPeriodNumber = await getCurrentPeriodNumber();
    let period = currentPeriodNumber === 2 ? 1 : await getLatestDrawPeriodNumber() + 1;
    await draw(period);
    logger.info('Done.');
})();