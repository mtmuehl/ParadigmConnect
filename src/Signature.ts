// Question: Can we do something simpler like this: (?)
// https://ethereum.stackexchange.com/questions/23701/can-i-web3-eth-sign-with-private-key

// TODO:
//   1. Refactor static methods

const ethUtil = require('ethereumjs-util');
const solSHA3 = require('ethereumjs-abi').soliditySHA3;

class Signature {

  static async generate(web3, messageHex, signer) {
    let raw, signature;
    [raw, signature] = await Signature.sign(web3, messageHex, signer);

    if(!Signature.validate(messageHex, signature, signer))
      signature = ethUtil.fromRpcSig(raw);

    if(!Signature.validate(messageHex, signature, signer))
      throw new Error('Bad signature.');

    return Signature.toJSON(signature);
  }

  static validate(messageHex, signature, signer) {
    return Signature.recoverAddress(messageHex, signature) === signer.toLowerCase();
  }

  static recoverAddress(messageHex, signature) {
    const msgBuffer = ethUtil.hashPersonalMessage(ethUtil.toBuffer(messageHex));
    try {
      const rawPub = ethUtil.ecrecover(msgBuffer, signature.v, signature.r, signature.s);
      return ethUtil.bufferToHex(ethUtil.publicToAddress(rawPub));
    } catch (e) { // what should this return?
      return false;
    }
  }

  static async sign(web3, messageHex, signer) {
    const raw = await Signature.getRaw(web3, messageHex, signer);
    const buffer     = Signature.getBuffer(raw);

    return [raw, Signature.setVRS(buffer)];
  }

  static async getRaw(web3, messageHex, signer) {
    let raw;

    try {
      raw = await web3.eth.personal.sign(messageHex, signer)
    } catch (e) {
      raw = await web3.eth.sign(messageHex, signer);
    }

    return raw;
  }

  static getBuffer(raw) {
    return ethUtil.toBuffer(raw);
  }

  static setVRS(buffer) {
    let v = buffer[0];
    const r = buffer.slice(1, 33);
    const s = buffer.slice(33, 65);
    if(v < 27) v = 27;
    return { v, r, s };
  }

  static hash(dataTypes, values) {
    return ethUtil.bufferToHex(solSHA3(dataTypes, values));
  }

  static toJSON(signature) {
    return {
      v: signature.v,
      r: ethUtil.bufferToHex(signature.r),
      s: ethUtil.bufferToHex(signature.s)
    }
  }
}

module.exports = Signature;
