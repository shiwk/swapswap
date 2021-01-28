const AElf = require('aelf-sdk');
const ENV = require('../env');

async function pollMining(transactionId, logger) {
    console.log(`>> Waiting for ${transactionId} the transaction to be mined.`);

    await new Promise(resolve => setTimeout(resolve, 2000))
        .catch(function () {
            logger.error("PollMining Promise Rejected");
        });

    let aelf = new AElf(new AElf.providers.HttpProvider(ENV.aelf.provider));
    const currentResult = await aelf.chain.getTxResult(transactionId);

    if (currentResult.Status === 'MINED') {
        logger.info('Tx Result:\n', currentResult);
        return currentResult;
    }

    return await pollMining(aelf, transactionId);
}

module.exports = {
    pollMining: pollMining
}