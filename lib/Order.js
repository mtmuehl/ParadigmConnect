const ethUtil = require('ethereumjs-util');
const solSHA3 = require('ethereumjs-abi').soliditySHA3;

const Signature = require('./Signature.js');
const utils = require('./utils');

class Order {

  constructor(options) {
    if(options.subContract === undefined) throw new Error('subContract is required');
    if(!this.web3.utils.isAddress(options.subContract)) throw new Error('subContract is not a valid address');

    this.subContract      = options.subContract;
    this.maker            = options.maker;
    this.makerArguments   = options.makerArguments;
    this.takerArguments   = options.takerArguments;
    this.makerValues      = options.makerValues;
    this.makerSignature   = options.makerSignature;
    this.posterSignature  = options.posterSignature;
    this.id               = options.id;
  }

  async make() {
    await this._checkArguments();

    let signature = await Signature.generate(this.web3, this.makerHex(), this.maker);
    this.makerSignature = signature;

    this.makerValues.signatureV = signature.v;
    this.makerValues.signatureR = signature.r;
    this.makerValues.signatureS = signature.s;
  }

  async isValid() {
    await this._checkArguments();
    const makerValuesBytes = this._serialize(this.makerArguments, this.makerValues);
    return await this.orderGateway.isValid(this.subContract, makerValuesBytes);
  }

  async amountRemaining() {
    await this._checkArguments();
    const makerValuesBytes = this._serialize(this.makerArguments, this.makerValues);
    return await this.orderGateway.amountRemaining(this.subContract, makerValuesBytes);
  }

  async take(taker, takerValues) {
    await this._checkArguments();
    const makerValuesBytes = this._serialize(this.makerArguments, this.makerValues);
    const takerValuesBytes = this._serialize(this.takerArguments, takerValues);
    return await this.orderGateway.participate(this.subContract, this.id, makerValuesBytes, takerValuesBytes, taker)
  }

  async prepareForPost(poster) {
    this.poster = poster || this.maker;
    await this._checkArguments();
    this.posterSignature = await Signature.generate(this.web3, this.posterHex(), this.poster)
  }

  async estimateGasCost(taker, takerValues) {
    await this._checkArguments();
    const makerValuesBytes = this._serialize(this.makerArguments, this.makerValues);
    const takerValuesBytes = this._serialize(this.takerArguments, takerValues);
    return await this.orderGateway.participateEstimateGas(this.subContract, this.id, makerValuesBytes, takerValuesBytes, taker)
  }

  recoverMaker() {
    return Signature.recoverAddress(this.makerHex(), this.makerSignature);
  }

  recoverPoster() {
    return Signature.recoverAddress(this.posterHex(), this.posterSignature);
  }

  toJSON() {
    return {
      subContract: this.subContract,
      maker: this.maker,
      makerArguments: this.makerArguments,
      takerArguments: this.takerArguments,
      makerValues: this.makerValues,
      makerSignature: this.makerSignature,
      posterSignature: this.posterSignature,
      id: this.id
    }
  }

  makerHex() {
    return this._hexFor('maker');
  }

  posterHex() {
    return this._hexFor('poster');
  }

  // Private Methods

  _serialize(args, values) {
    return args.map(arg => utils.toBytes32( values[arg.name] ));
  }

  _shouldInclude(argument) {
    return this.makerValues[argument.name] != undefined;
  }

  _toHex(dataTypes, values) {
    return ethUtil.bufferToHex(solSHA3(dataTypes, values));
  }

  _hexFor(signer) {
    let dataTypes = [], values = [];
    this.makerArguments.forEach((argument) => {
      if(signer == 'maker' && argument.name.includes('signature')) return;
      if (this._shouldInclude(argument)) {
        dataTypes.push(argument.dataType);
        values.push(this.makerValues[argument.name].toString());
      }
    });
    return this._toHex(dataTypes, values);
  }

  async _checkArguments() {
    /*
      Retrieves required arguments from subcontract
      if they are missing and parses JSON strings.
    */
    if(typeof this.makerArguments === 'undefined') this.makerArguments = await this.orderGateway.makerArguments(this.subContract);
    if(typeof this.takerArguments === 'undefined') this.takerArguments = await this.orderGateway.takerArguments(this.subContract);

    if(typeof this.makerArguments === 'string') this.makerArguments = JSON.parse(this.makerArguments);
    if(typeof this.takerArguments === 'string') this.takerArguments = JSON.parse(this.takerArguments);
  }

}

module.exports = Order;
