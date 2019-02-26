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
    }

    async totalSupply() {
        await this.initializing;
        return await this.contract.totalSupply();
    }

    async balanceOf(owner) {
        await this.initializing;
        return await this.contract.balanceOf(owner);
    }

    async transfer(to, value) {
        await this.initializing;
        return await this.contract.transfer(to, value);
    }

    async transferFrom(from, to, value) {
        await this.initializing;
        return await this.contract.transferFrom(from, to, value);
    }

    async approve(spender, value) {
        await this.initializing;
        return await this.contract.approve(spender, value);
    }

    async allowance(owner, spender) {
        await this.initializing;
        return await this.contract.allowance(owner, spender);
    }


}

module.exports = DigmToken;
