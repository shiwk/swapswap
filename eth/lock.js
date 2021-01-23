const ENV = require('../env');
const WEB3 = require('web3');
const LOCK = require('../build/contracts/LockMapping.json');

let web3 = new WEB3(ENV.eth.provider);
let lockContract = new web3.eth.Contract(LOCK.abi, ENV.eth.lockContract);


async function getReceipt(id) {
    console.log(`Try get receipt [${id}]`);

    let receipt = await lockContract.methods.receipts(id).call({from: ENV.eth.defaultAddress}, function (error, result) {
        // console.log(result);
    });

    return {
        'amount': receipt['amount'],
        'targetAddress': receipt['targetAddress']
    }
}

async function getReceiptCount() {
    return await lockContract.methods.receiptCount().call({from: ENV.eth.defaultAddress}, function (error, result) {
        console.log("receipt count:", result);
    });
}


async function getTotalAmountInReceipts() {
    return await lockContract.methods.totalAmountInReceipts().call({from: ENV.eth.defaultAddress}, function (error, result) {
        console.log("totalAmountInReceipts:", result);
    });
}

// (async () => {
//     await getReceiptCount();
//     await getTotalAmountInReceipts();
// })();

module.exports = {
    getLockInfo: getReceipt,
    getLockTimes: getReceiptCount,
    getTotalLockAmount: getTotalAmountInReceipts
}


