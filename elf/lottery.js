const ENV = require('../env');
const AElf = require('aelf-sdk');
const Wallet = AElf.wallet;
const AELFHelper = require('elf/aelf_helper');

let aelf = new AElf(new AElf.providers.HttpProvider(ENV.aelf.provider));
let wallet = Wallet.getWalletByPrivateKey(ENV.aelf.defaultPriKey);