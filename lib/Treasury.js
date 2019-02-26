const TreasuryContractData = require('paradigm-contracts').contracts.Treasury;
const TruffleContract = require('truffle-contract');

class Treasury {
    constructor(options, digmToken) {
        this.web3 = options.web3;
        this.digmToken = digmToken;
        this.initializing = this.init(options);
    }

    async init(options) {
        const TreasuryContract = TruffleContract(TreasuryContractData);
        TreasuryContract.setProvider(this.web3.currentProvider);
        if (options.treasuryAddress) {
            this.contract = TreasuryContract.at(this.address);
        } else {
            this.contract = await TreasuryContract.deployed().catch(() => { throw new Error('Invalid network for Treasury') });
        }

        this.coinbase = await this.web3.eth.getCoinbase();
    }

    async deposit(value) {
        await this.initializing;
        const coinbase = await this.web3.eth.getCoinbase();
        const hasBalance = await this.digmToken.balanceOf(coinbase).then((bal) => bal.gte(value));
        const hasApproval = await this.digmToken.allowance(coinbase, this.contract.address).then((all) => all.gte(value));

        if(!hasBalance) {
            throw new Error(`${coinbase} has insufficient balance to deposit`);
        }

        if(!hasApproval) {
            console.log(`${coinbase} has insufficient approval; Setting approval`);
            await this.digmToken.approve(this.contract.address, value);
        }

        return await this.contract.deposit(value, { from: this.coinbase });
    }

    async withdraw(value) {
        await this.initializing;
        return await this.contract.withdraw(value, { from: this.coinbase });
    }

    async systemBalance(address) {
        await this.initializing;
        return await this.contract.systemBalance.call(address);
    }

    async currentBalance(address) {
        await this.initializing;
        return await this.contract.currentBalance.call(address);
    }
}

module.exports = Treasury;
