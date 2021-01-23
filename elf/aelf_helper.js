async function pollMining(aelf, transactionId) {
    console.log(`>> Waiting for ${transactionId} the transaction to be mined.`);

    const currentResult = await aelf.chain.getTxResult(transactionId);

    if (currentResult.Status !== 'PENDING') {
        console.log('Tx Result:\n', currentResult);
        return currentResult;
    }

    await new Promise(resolve => setTimeout(resolve, 2000))
        .catch(function () {
            console.log("Promise Rejected");
        });

    await pollMining(aelf, transactionId);
}

module.exports = {
    pollMining: pollMining
}