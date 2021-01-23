const ENV = require('../env');
const AElf = require('aelf-sdk');
const Wallet = AElf.wallet;
const elfHelper = require('elf/elf_helper');

let aelf = new AElf(new AElf.providers.HttpProvider(ENV.aelf.provider));
let wallet = Wallet.getWalletByPrivateKey(ENV.aelf.defaultPriKey);