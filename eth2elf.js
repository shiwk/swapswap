const lock = require('./eth/lock');
const merkle = require('./eth/merkle');
const swap = require('./elf/swap');
const merkleTreeRecorder = require('./elf/merkle_tree_recorder');
const ENV = require('./env');
const log = require('./logger');


const logger = log.createLogger('logs/eth2elf');

async function getDepositAmount(symbol) {
    let pair = await swap.getSwapPair(symbol).catch(err => {
        logger.error(err.stack);
        throw err;
    });
    logger.info(`deposit amount for ${symbol}: ${pair.depositAmount}`);
    logger.info(`swapped amount for ${symbol}: ${pair.swappedAmount}`);
    return Number(pair.depositAmount) + Number(pair.swappedAmount);
}

async function deposit(symbol, amount) {
    logger.info(`Deposit ${amount} ${symbol} to swap contract.`);
    await swap.deposit(symbol, amount).catch(err => {
        logger.error(err.stack);
        throw err;
    });
}

async function getLockTimes() {
    let res = await lock.getLockTimes().catch(err => {
        logger.error(err.stack);
        throw err;
    });
    logger.info(`receipt count: ${res}`);
    return Number(res);
}

async function getTotalLockAmount() {
    let res = await lock.getTotalLockAmount().catch(err => {
        logger.error(err.stack);
        throw err;
    });
    logger.info(`totalAmountInReceipts: ${res}`);
    return Number(res);
}

async function getMerkleTree(expectCount) {
    logger.info(`Try get merkle tree, expect count: ${expectCount}`);
    return await merkle.getMerkleTree(expectCount).catch(err => {
        logger.error(err.stack);
        throw err;
    });
}

async function getLastRecordedLeafIndex() {
    let res = await merkleTreeRecorder.getLastRecordedLeafIndex().catch(err => {
        logger.error(err.stack);
        throw err;
    });
    logger.info(`LastRecordedLeafIndex: ${res}`);
    return Number(res);
}

async function getSatisfiedTreeCount() {
    let res = await merkleTreeRecorder.getSatisfiedTreeCount().catch(err => {
        logger.error(err.stack);
        throw err;
    });
    logger.info(`SatisfiedTreeCount: ${res}`);
    return Number(res);
}

async function recordMerkleTree(lastLeafIndex, root) {
    logger.info(`Try record merkle tree, lastLeafIndex: ${lastLeafIndex}`);
    await merkleTreeRecorder.recordMerkleTree(lastLeafIndex, root).catch(err => {
        logger.error(err.stack);
        throw err;
    });
}

async function wait(millSeconds) {
    await new Promise(resolve => setTimeout(resolve, millSeconds))
        .catch(function () {
            logger.error("Promise Rejected");
        });
}

async function depositToSwapIfNeeded() {
    let totalLockAmount = await getTotalLockAmount();
    let depositELF = await getDepositAmount('ELF');
    let depositLOT = await getDepositAmount('LOT');

    let expectedELF = Math.ceil(totalLockAmount / 10_000_000_000 / 400);
    logger.info(`expectedELF: ${expectedELF}`);

    if (expectedELF + ENV.aelf.swap.init_deposit.elf > depositELF) {
        logger.info(`more ELF needed: ${expectedELF + ENV.aelf.swap.init_deposit.elf - depositELF}`);
        await deposit('ELF', expectedELF + ENV.aelf.swap.init_deposit.elf - depositELF);
    }

    let expectedLOT = Math.ceil(totalLockAmount / 10_000_000_000);
    logger.info(`expectedLOT: ${expectedLOT}`);

    if (expectedLOT + ENV.aelf.swap.init_deposit.lot > depositLOT) {
        logger.info(`more LOT needed: ${expectedLOT + ENV.aelf.swap.init_deposit.lot - depositLOT}`);
        await deposit('LOT', expectedLOT + ENV.aelf.swap.init_deposit.lot - depositLOT);
    }
}

(async () => {
    while (true) {
        await depositToSwapIfNeeded();
        let lockTimes = await getLockTimes();
        let lastRecordedLeafIndex = await getLastRecordedLeafIndex();

        if (lockTimes <= lastRecordedLeafIndex + 1)
            break;

        let satisfiedTreeCount = await getSatisfiedTreeCount();
        let expectCount = (satisfiedTreeCount + 1) * ENV.aelf.record.maximal_leaf_count;
        let merkleTree = await getMerkleTree(expectCount);

        let lastLeafIndex = Number(merkleTree[2]) + Number(merkleTree[3]) - 1;
        let root = merkleTree[1];
        await recordMerkleTree(lastLeafIndex, root);
        await wait(1000);
    }

    logger.info('Done.');
})();