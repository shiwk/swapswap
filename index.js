const lock = require('./lock');
const airdrop = require('./airdrop');
const ENV = require('./env');

async function getNextAirdropId() {
    return await airdrop.getAirdropCount().catch(err => console.log(err));
}

async function getLockInfo(id) {
    return await lock.getLockInfo(id).catch(err => console.log(err));
}

async function getLockTimes() {
    return await lock.getLockTimes();
}

let id = getNextAirdropId().then(_ => {});
let maximalOnceAirdrop = ENV.maximalOnceAirdrop;
let totalLockTimes = getLockTimes().then(res => {
    for (let i = 0; i < maximalOnceAirdrop; i++) {
        if (i >= res)
            break;
        getLockInfo(i).then(res => console.log(res));
    }
});