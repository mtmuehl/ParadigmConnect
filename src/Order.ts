import * as ethUtil from "ethereumjs-util";
import { soliditySHA3 as solSHA3 } from "ethereumjs-abi";

const Signature = require('./Signature.js');
const utils = require('./utils');

export class Order {
  // order fields
  private subContract;
  private maker;
  private makerArguments;
  private takerArguments;
  private makerValues;
  private makerSignature;
  private posterSignature;
  private poster;
  private id;

  // other
  private web3;
  private orderGateway;

  constructor(options: OrderOptions) {
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

  public async make(): Promise<void> {
    await this._checkArguments();

    let signature = await Signature.generate(this.web3, this.makerHex(), this.maker);
    this.makerSignature = signature;

    this.makerValues.signatureV = signature.v;
    this.makerValues.signatureR = signature.r;
    this.makerValues.signatureS = signature.s;
  }

  public async isValid(): Promise<boolean> {
    await this._checkArguments();
    const makerValuesBytes = this._serialize(this.makerArguments, this.makerValues);
    return await this.orderGateway.isValid(this.subContract, makerValuesBytes);
  }

  public async amountRemaining(): Promise<number> {
    await this._checkArguments();
    const makerValuesBytes = this._serialize(this.makerArguments, this.makerValues);
    return await this.orderGateway.amountRemaining(this.subContract, makerValuesBytes);
  }

  public async take(taker: string, takerValues: object): Promise<boolean> {
    await this._checkArguments();
    const makerValuesBytes = this._serialize(this.makerArguments, this.makerValues);
    const takerValuesBytes = this._serialize(this.takerArguments, takerValues);
    return await this.orderGateway.participate(this.subContract, this.id, makerValuesBytes, takerValuesBytes, taker)
  }

  public async prepareForPost(poster: string): Promise<void> {
    this.poster = poster || this.maker;
    this._clearArguments();
    await this._checkArguments();
    this.posterSignature = await Signature.generate(this.web3, this.posterHex(), this.poster)
  }

  public async estimateGasCost(taker: string, takerValues: object): Promise<number> {
    await this._checkArguments();
    const makerValuesBytes = this._serialize(this.makerArguments, this.makerValues);
    const takerValuesBytes = this._serialize(this.takerArguments, takerValues);
    return await this.orderGateway.participateEstimateGas(this.subContract, this.id, makerValuesBytes, takerValuesBytes, taker)
  }

  public recoverMaker(): string {
    return Signature.recoverAddress(this.makerHex(), this.makerSignature);
  }

  public recoverPoster(): string {
    return Signature.recoverAddress(this.posterHex(), this.posterSignature);
  }

  public toJSON(): object {
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

  public makerHex(): string {
    return this._hexFor('maker');
  }

  public posterHex(): string {
    return this._hexFor('poster');
  }

  // Private Methods

  private _serialize(args, values): string[] {
    return args.map(arg => utils.toBytes32( values[arg.name] ));
  }

  private _shouldInclude(argument): boolean {
    return this.makerValues[argument.name] != undefined;
  }

  private _toHex(dataTypes, values): string {
    return ethUtil.bufferToHex(solSHA3(dataTypes, values));
  }

  private _hexFor(signer): string {
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

  private _clearArguments(): void {
    delete this.makerArguments;
    delete this.takerArguments;
  }

  private async _checkArguments(): Promise<void> {
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
