const ENV = require('./env');
const WEB3 = require('web3');
const LOCK = require('./build/contracts/LockMapping.json');

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
        console.log(result);
    });
}

module.exports = {
    getLockInfo: getReceipt,
    getLockTimes: getReceiptCount
}

// getReceipt(0).then(res => {
//     console.log(res);
// });
//
//
// getReceiptCount().then(res => {
//     console.log(res);
//     console.log('Done.');
// });
