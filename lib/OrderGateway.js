const OrderGatewayContract = require('paradigm-core-solidity/build/contracts/OrderGateway');

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

  async participate(subContract, makerData, takerData, taker) {
    const transaction = this._participateTransaction(subContract, makerData, takerData);
    // let gas = await transaction.estimateGas({ from: taker });
    let gas = 4000000; //TODO: Gas cost is causing issues across many usages of this function.  This needs to be further investigated. Hard coding ot mitigate teh issue for now.
    return await transaction.send({ from: taker, gas });
  }

  async participateEstimateGas(subContract, makerData, takerData, taker) {
    const transaction = this._participateTransaction(subContract, makerData, takerData);
    return await transaction.estimateGas({ from: taker })
  }

  async makerArguments(subContract) {
    return await this.contract.methods.makerArguments(subContract).call();
  }

  async takerArguments(subContract) {
    return await this.contract.methods.takerArguments(subContract).call();
  }

  _participateTransaction(subContract, makerData, takerData) {
    return this.contract.methods.participate(subContract, makerData, takerData);
  }
}

module.exports = OrderGateway;
