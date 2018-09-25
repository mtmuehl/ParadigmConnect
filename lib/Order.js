const Signature = require('./Signature.js');
const utils = require('./utils');

class Order {

  // TODO:
  //   0. Get ParadigmContracts running on TestRPC
  //   1. Work out how to make/take deals ==> Set up a dummy SubContract to pass in
  //   2. web3 and orderGateway should be instantiated in some kind of Paradigm {} class.
  //   3. Paradigm should be either passed in or accessible everywhere
  constructor(options) {
    if(options.subContract === undefined) throw new Error('SubContract is required');

    this.subContract      = options.subContract;
    this.maker            = options.maker;
    this.makerArguments   = options.makerArguments; // -> makerArguments
    this.takerArguments   = options.takerArguments; // -> takerArguments
    this.makerValues      = options.makerValues;
    this.makerSignature   = options.makerSignature;
  }

  async make() {
    await this.checkArguments();
    if(this.needsToBeSigned()) {
      const orderHex = this.formatData();
      this.makerValues.signature = await Signature.generate(this.web3, orderHex, this.maker);
    }
  }

  async prepareForPost(poster) {
    this.poster = poster || this.maker;
    await this.checkArguments();
    this.posterSignature = await Signature.generate(this.web3, this.hashContractData(), this.poster )
  }

  async take(taker, takerValues) {
    await this.checkArguments();
    const makerValuesBytes = this.serialize(this.makerArguments, this.makerValues);
    const takerValuesBytes = this.serialize(this.takerArguments, takerValues);
    return await this.orderGateway.participate(this.subContract, makerValuesBytes, takerValuesBytes, taker)
  }

  async _takeEstimateGas(taker, takerValues) {
    await this.checkArguments();
    const makerValuesBytes = this.serialize(this.makerArguments, this.makerValues);
    const takerValuesBytes = this.serialize(this.takerArguments, takerValues);
    return await this.orderGateway.participateEstimateGas(this.subContract, makerValuesBytes, takerValuesBytes, taker)
  }

  recoverMaker() {
    if (this.makerValues.signature === undefined && !this.needsToBeSigned()) {
      return this.maker;
    } else {
      return Signature.recoverAddress(this.formatData(), this.makerValues.signature);
    }
  }

  recoverPoster() {
    return Signature.recoverAddress(this.hashContractData(), this.posterSignature);
  }

  toJSON() {
    return {
      subContract: this.subContract,
      maker: this.maker,
      makerArguments: this.makerArguments,
      takerArguments: this.takerArguments,
      makerValues: this.makerValues,
      makerSignature: this.makerSignature
    }
  }

  serialize(args, values) {
    const output = [];

    args.forEach((arg) => {
      if(arg.dataType === 'signature') {
        if(values[arg.name] instanceof Signature) values[arg.name] = values[arg.name].toJSON();
        output.push(utils.toBytes32(values[arg.name].v));
        output.push(utils.toBytes32(values[arg.name].r));
        output.push(utils.toBytes32(values[arg.name].s));
      } else if(arg.dataType === 'signedTransfer') {
        output.push(utils.toBytes32(values[arg.name].recipient));
        output.push(utils.toBytes32(values[arg.name].maxAmount));
        output.push(utils.toBytes32(values[arg.name].signature.v));
        output.push(utils.toBytes32(values[arg.name].signature.r));
        output.push(utils.toBytes32(values[arg.name].signature.s));
        output.push(utils.toBytes32(values[arg.name].nonce));
      } else {
        output.push(utils.toBytes32(values[arg.name]));
      }
    });

    return output;
  }

  async checkArguments() {
    /*
      Retrieves required arguments from subcontract
      if they are missing and parses JSON strings.
    */
    if(typeof this.makerArguments === 'undefined') this.makerArguments = await this.orderGateway.makerArguments(this.subContract);
    if(typeof this.takerArguments === 'undefined') this.takerArguments = await this.orderGateway.takerArguments(this.subContract);

    if(typeof this.makerArguments === 'string') this.makerArguments = JSON.parse(this.makerArguments);
    if(typeof this.takerArguments === 'string') this.takerArguments = JSON.parse(this.takerArguments);
  }

  formatData() {
    let dataTypes = [], values = [];
    this.makerArguments.forEach((argument) => {
      if(argument.dataType === 'signature') return; //TODO: consider alternative fix for this.
      if (this.shouldInclude(argument)) {
        dataTypes.push(argument.dataType);
        values.push(this.makerValues[argument.name].toString());
      }
    });
    return Signature.hash(dataTypes, values);
  }

  hashContractData() {
    const dataTypes = [];
    const makerValuesBytes = this.serialize(this.makerArguments, this.makerValues);
    makerValuesBytes.forEach(b => dataTypes.push('bytes32'));
    return Signature.hash(dataTypes, makerValuesBytes);
  }

  shouldInclude(argument) {
    return this.makerValues[argument.name] != undefined && argument.dataType != 'signedTransfer';
  }

  needsToBeSigned() {
    let needsToBeSigned = false;
    this.makerArguments.forEach(arg => needsToBeSigned = arg.name === 'signature');
    return needsToBeSigned;
  }
}

module.exports = Order;
