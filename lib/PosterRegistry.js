const PosterRegistryProxyContractData = require('paradigm-contracts').contracts.PosterRegistryProxy;
const TruffleContract = require('truffle-contract');

class PosterRegistry {
    constructor(options, treasury) {
        this.web3 = options.web3;
        this.treasury = treasury;
        this.initializing = this.init(options);
    }

    async init(options) {
        const PosterRegistryProxyContract = TruffleContract(PosterRegistryProxyContractData);
        PosterRegistryProxyContract.setProvider(this.web3.currentProvider);
        if (options.posterRegistryProxyAddress) {
            this.contract = PosterRegistryProxyContract.at(options.posterRegistryProxyAddress);
        } else {
            this.contract = await PosterRegistryProxyContract.deployed().catch(() => { throw new Error('Invalid network for PosterRegistry') });
        }

        this.coinbase = await this.web3.eth.getCoinbase();
    }

    async tokensContributed() {
        await this.initializing;
        return await this.contract.tokensContributed.call();
    }

    async tokensRegisteredFor(address) {
        await this.initializing;
        return await this.contract.tokensRegisteredFor.call(address);
    }

    async registerTokens(amount) {
        await this.initializing;
        const coinbase = await this.web3.eth.getCoinbase();
        const hasBalance = await this.treasury.currentBalance(coinbase).then((bal) => bal.gte(amount));

        if(!hasBalance) {
            console.log(`${coinbase} has insufficient available Treasury balance; Depositing Tokens`);
            await this.treasury.deposit(value);
        }

        return await this.contract.registerTokens(amount, { from: this.coinbase });
    }

    async releaseTokens(amount) {
        await this.initializing;
        return await this.contract.releaseTokens(amount, { from: this.coinbase });
    }
}

module.exports = PosterRegistry;
