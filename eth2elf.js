const lock = require('./eth/lock');
const merkle = require('./eth/merkle');
const swap = require('./elf/swap');
const ENV = require('./env');


async function getDepositAmount(symbol){
    return await swap.getDepositAmount(symbol).catch(console.log);
}

async function getSwapRoundCount() {
    return await swap.getSwapRoundCount().catch(console.log);
}

async function deposit(symbol, amount){
    return await swap.deposit(symbol, amount).catch(console.log);
}

async function createNewRound(merkleTreeRoot, roundId){
    return await swap.createSwapRound(merkleTreeRoot, roundId).catch(console.log);
}

async function getLockTimes() {
    return await lock.getLockTimes().catch(console.log);
}

async function getTotalLockAmount(){
    return await lock.getTotalLockAmount().catch(console.log);
}

async function getReceiptCountInTree(){
    return await merkle.getReceiptCountInTree().catch(console.log);
}

async function generateMerkleTree(){
    return await merkle.generateMerkleTree().catch(console.log);
}

async function getTreeCount() {
    return await merkle.getTreeCount().catch(console.log);
}

async function getTreeRoot(index) {
    return await merkle.getTreeRoot(index).catch(console.log);
}


async function wait(seconds){
    await new Promise(resolve => setTimeout(resolve, seconds))
        .catch(function () {
            console.log("Promise Rejected");
        });
}

(async () => {

    let totalLockAmount = await getTotalLockAmount();
    let depositELF = await getDepositAmount('ELF');
    let depositLOT = await getDepositAmount('LOT');

    let expectedELF = totalLockAmount / 10_000_000_000 / 400;
    console.log("expectedELF:", expectedELF);

    if (expectedELF + ENV.aelf.swap.init_deposit.elf > depositELF) {
        console.log("more ELF needed:", expectedELF);
        await deposit('ELF', expectedELF + ENV.aelf.swap.init_deposit.elf - depositELF);
    }

    let expectedLOT = totalLockAmount / 10_000_000_000;
    console.log("expectedLOT:", expectedLOT);
    if (expectedLOT + ENV.aelf.swap.init_deposit.lot > depositLOT) {
        console.log("more LOT needed:", expectedELF);
        await deposit('LOT', expectedLOT + ENV.aelf.swap.init_deposit.lot - depositLOT);
    }

    while (true) {
        let lockTimes = await getLockTimes();
        let receiptCountInTree = await getReceiptCountInTree();
        if (lockTimes <= receiptCountInTree)
            break;
        await generateMerkleTree();
        await wait(5000);
    }

    while (true){
        let roundCount = await getSwapRoundCount();
        let treecount = await getTreeCount();

        if (treecount <= roundCount)
            break;

        let root = await getTreeRoot(roundCount);
        await createNewRound(root, roundCount);
    }

    console.log('Done.');
})();