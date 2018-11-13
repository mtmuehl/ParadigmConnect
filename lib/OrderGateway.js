const OrderGatewayContract = require('paradigm-protocol-contracts/build/contracts/OrderGateway');

class OrderGateway {
  constructor(options) {
    this.web3 = options.web3;
    this.initializing = this.init(options);
  }

  async init(options) {
    const networkId = options.networkId || await options.web3.eth.net.getId();
    if (options.orderGatewayAddress) {
      this.address = options.orderGatewayAddress;
      this.contract = new this.web3.eth.Contract(OrderGatewayContract.abi, this.address);
    } else if (OrderGatewayContract.networks[networkId]) {
      this.address = OrderGatewayContract.networks[networkId].address;
      this.contract = new this.web3.eth.Contract(OrderGatewayContract.abi, this.address);
    } else {
      this.contract = await (new this.web3.eth.Contract(OrderGatewayContract.abi))
        .deploy({ data: OrderGatewayContract.bytecode }).send({ from: await this.web3.eth.getCoinbase(), gas: 4500000 });
      this.address = this.contract._address;
    }
  }

  async participate(subContract, id, makerData, takerData, taker) {
    const transaction = this._participateTransaction(subContract, id, makerData, takerData);
    // let gas = await transaction.estimateGas({ from: taker });
    let gas = 4000000; //TODO: Gas cost is causing issues across many usages of this function.  This needs to be further investigated. Hard coding ot mitigate teh issue for now.
    return await transaction.send({ from: taker, gas });
  }

  async participateEstimateGas(subContract, id, makerData, takerData, taker) {
    const transaction = this._participateTransaction(subContract, id, makerData, takerData);
    return await transaction.estimateGas({ from: taker })
  }

  async makerArguments(subContract) {
    return await this.contract.methods.makerArguments(subContract).call();
  }

  async takerArguments(subContract) {
    return await this.contract.methods.takerArguments(subContract).call();
  }

  async isValid(subContract, makerData) {
    return await this.contract.methods.isValid(subContract, makerData).call();
  }

  async amountRemaining(subContract, makerData) {
    return await this.contract.methods.amountRemaining(subContract, makerData).call();
  }

  oneEvent(callback, filter = {}) {
    this.contract.once('Participation', filter, callback);
  }

  _participateTransaction(subContract, id = '', makerData, takerData) {
    return this.contract.methods.participate(subContract, id, makerData, takerData);
  }
}

module.exports = OrderGateway;
