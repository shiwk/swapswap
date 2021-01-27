const ssc = require('./elf/ssc');

async function getCurrentPeriod() {
    return await ssc.getCurrentPeriod().catch(console.log);
}

async function getLatestDrawPeriod() {
    return await ssc.getLatestDrawPeriod().catch(console.log);
}

async function prepareDraw() {
    return await ssc.prepareDraw().catch(console.log);
}

async function draw(period) {
    return await ssc.draw(period).catch(console.log);
}

(async () => {
    let latestPeriod = await getLatestDrawPeriod();
    let currentPeriod = await getCurrentPeriod();
    await prepareDraw();
    let period = currentPeriod.periodNumber === 1 ? 1 : Number(latestPeriod.periodNumber) + 1;
    await draw(period);
    console.log('Draw done.');
})();