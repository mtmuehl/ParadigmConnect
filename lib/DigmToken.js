const DigmTokenContractData = require('paradigm-contracts').contracts.DigmToken;
const TruffleContract = require('truffle-contract');

class DigmToken {
    constructor(options) {
        this.web3 = options.web3;
        this.initializing = this.init(options);
    }

    async init(options) {
        const DigmTokenContract = TruffleContract(DigmTokenContractData);
        DigmTokenContract.setProvider(this.web3.currentProvider);
        if (options.digmTokenAddress) {
            this.contract = DigmTokenContract.at(options.digmTokenAddress);
        } else {
            this.contract = await DigmTokenContract.deployed().catch(() => { throw new Error('Invalid network for DigmToken') });
        }

        this.coinbase = await this.web3.eth.getCoinbase();
    }

    async totalSupply() {
        await this.initializing;
        return await this.contract.totalSupply.call();
    }

    async balanceOf(owner) {
        await this.initializing;
        return await this.contract.balanceOf.call(owner);
    }

    async transfer(to, value) {
        await this.initializing;
        return await this.contract.transfer(to, value, { from: this.coinbase });
    }

    async transferFrom(from, to, value) {
        await this.initializing;
        return await this.contract.transferFrom(from, to, value, { from: this.coinbase });
    }

    async approve(spender, value) {
        await this.initializing;
        return await this.contract.approve(spender, value, { from: this.coinbase });
    }

    async allowance(owner, spender) {
        await this.initializing;
        return await this.contract.allowance.call(owner, spender);
    }


}

module.exports = DigmToken;
