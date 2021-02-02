const log = require('./logger');
const token = require('./elf/token');
const ENV = require('./env');
const BAL = require('./bal.json');
const logger = log.createLogger('logs/balance');

async function getBalance(address, symbol, threshold, keyword) {
    let bal = await token.balanceOf(address, symbol).catch(err => {
        logger.error(err.stack);
        throw err;
    });
    logger.info(`[${symbol}] Balance of [${keyword}] ${address}: ${bal / 100_000_000}`);

    if (bal < threshold){
        logger.error(`[${symbol}] Balance of [${keyword}] ${address}: ${bal / 100_000_000}, less than ${threshold/ 100_000_000}`);
    }
    return bal;
}

(async() => {
    let admin_elf_bal = await getBalance(ENV.aelf.admin, "ELF", BAL.ELF.admin, 'admin');
    let admin_lot_bal = await getBalance(ENV.aelf.admin, "LOT", BAL.LOT.admin, 'admin');

    let issuer_elf_bal = await getBalance(ENV.aelf.issuer, "ELF", BAL.ELF.issuer, 'issuer');

    let ssc_lot_bal = await getBalance(ENV.aelf.sscContract, "ELF", BAL.LOT.ssc, 'ssc');

    let daily_elf_bal = await getBalance(ENV.aelf.daily, "ELF", BAL.ELF.daily, 'daily');
    let daily_lot_bal = await getBalance(ENV.aelf.daily, "LOT", BAL.LOT.daily, 'daily');
})();