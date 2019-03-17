
//Third party imports
import * as ethUtil from "ethereumjs-util";
import { soliditySHA3 as solSHA3 } from "ethereumjs-abi";
import Web3 = require("web3");

//Defines the object used to store the components of an Ethereum signature
interface VRS{
  v: number;
  r: Buffer | Uint8Array;
  s: Buffer | Uint8Array;
}

/**
 * A class the wraps signatory creation, recovery, and validation functions from
 * the web3 library.
 *
 */
export class Signature {


  /**
   * Generates an ECDSA signature using the web3 library given a message and address
   *
   * @param web3           {Web3}   a web3 instance
   * @param messageHex     {number} message to sign; should be hashed by soliditysha3 using this class
   * @param signer         {string} the address of the signer; must be unlocked
   * @returns              {Object} JSON with the components of the signature
   */
  public static async generate(web3: Web3, messageHex: string, signer: string): Promise<object> {
    let raw, signature;
    [raw, signature] = await this.sign(web3, messageHex, signer);

    if(!Signature.validate(messageHex, signature, signer))
      signature = ethUtil.fromRpcSig(raw);

    if(!Signature.validate(messageHex, signature, signer))
      throw new Error('Bad signature.');

    return this.toJSON(signature);
  }


  /**
   * Determines whether a signature is valid or not
   *
   * @param messageHex     {number}  signed message
   * @param signature      {VRS}     object containing the components of the ECDSA signature
   * @param signer         {string}  the address of the signer
   * @returns              {boolean} whether or not the signature is valid
   */
  public static validate(messageHex: string, signature: VRS, signer: string): boolean {
    return this.recoverAddress(messageHex, signature) === signer.toLowerCase();
  }

  /**
   * Recovers the address of the signer given a signature
   *
   * @param messageHex     {number} total number of orders accepted per period
   * @param signature      {VRS}    object containing the components of the ECDSA signature
   * @returns              {string} the address of the signer
   */
  private static recoverAddress(messageHex: string, signature: VRS): string {
    const msgBuffer = ethUtil.hashPersonalMessage(ethUtil.toBuffer(messageHex));
    try {
      const rawPub = ethUtil.ecrecover(msgBuffer, signature.v, signature.r, signature.s);
      return ethUtil.bufferToHex(ethUtil.pubToAddress(rawPub));
    } catch (e) {
      //returns a blank address if above fails
      return '';
    }
  }

  /**
   * Recovers the address of the signer given a signature
   *
   * @param messageHex     {string}        total number of orders accepted per period
   * @param signer         {string}        the address of the signer
   * @returns              {[string, VRS]} tuple of raw signature and signature as VRS object
   */
  private static async sign(web3: Web3, messageHex: string, signer: string): Promise<[string, VRS]> {
    const raw = await this.getRaw(web3, messageHex, signer);
    const buffer     = this.getBuffer(raw);

    return [raw, this.setVRS(buffer)];
  }

  /**
   * Gets the raw signature given a message and signer
   *
   * @param messageHex     {number} total number of orders accepted per period
   * @param signer         {string} the address of the signer
   * @returns              {string} the raw signature
   */
  private static async getRaw(web3: Web3, messageHex: string, signer: string): Promise<string> {
    let raw;

    try {
      // @ts-ignore
      raw = await web3.eth.personal.sign(messageHex, signer)
    } catch (e) {
      raw = await web3.eth.sign(messageHex, signer);
    }

    return raw;
  }

  /**
   * Wraps the ethereumjs-util toBuffer function, turning a raw signature string into a buffer
   *
   * @param raw     {string}              raw signature
   * @returns       {Buffer | Uint8Array} signature as a buffer
   */
  private static getBuffer(raw: string): Buffer | Uint8Array{
    return ethUtil.toBuffer(raw);
  }


  /**
   * Extracts v, r, and s components of a signature as Buffer
   *
   * @param buffer     {Buffer | Uint8Array}  signature as Buffer
   * @returns          {VRS}                  signature as VRS object
   */
  private static setVRS(buffer: Buffer | Uint8Array): VRS {
    let v = buffer[0];
    const r = buffer.slice(1, 33);
    const s = buffer.slice(33, 65);

    //v should be 27 or 28, but 0 and 1 are also sometimes used
    if(v < 27) v += 27;

    return { v:v, r:r, s:s };
  }

  /**
   * Hashes an array of solidity data
   *
   * @param dataTypes     {Array<string>}  solidity types of the data
   * @param dataTypes     {Array<any>}     data to hash
   * @returns             {string}         soliditysha3 convenction hash of the data
   */
  public static hash(dataTypes: Array<string>, values: Array<any>): string {
    return ethUtil.bufferToHex(solSHA3(dataTypes, values));
  }

  /**
   * Transforms buffer values in a VRS object into strings
   *
   * @param signature     {VRS}    signature with buffer values
   * @returns             {object} signature with r and s converted to strings
   */
  private static toJSON(signature: VRS): object {
    return {
      v: signature.v,
      r: ethUtil.bufferToHex(signature.r),
      s: ethUtil.bufferToHex(signature.s)
    }
  }
}
