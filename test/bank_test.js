const Bank = require('../lib/Bank');

describe('Bank', () => {
  let bank;

  before(() => {
    bank = paradigm.bank;
  });

  describe('constructor', () => {
    it('should be created properly', () => {
      const testBank = new Bank('web3');

      testBank.web3.should.eq('web3');
      testBank.MAX_UINT.toString().should.eq(bank.MAX_UINT.toString());
    });
  });

  describe('giveMaxAllowanceFor()', () => {
    it('should set allowance to max uint value', async () => {
      await bank.giveMaxAllowanceFor(TKA, subContract, accounts[0]);
      (await tka.allowance(accounts[0], subContract)).should.eq(bank.MAX_UINT.toString());
    });
  });

  describe('giveAllowanceFor()', () => {
    it('should set allowance to max uint value', async () => {
      await bank.giveAllowanceFor(TKA, subContract, 500, accounts[0]);
      (await tka.allowance(accounts[0], subContract)).should.eq('500');
    });
  });

  describe('createTransfer()', () => {
    it('should build a transfer hash', () => {
      bank.createTransfer('a', 'b', 'c', 'd', 1, 2).should.deep.eq({
        transferer: 'a',
        tokenAddress: 'b',
        tokenHolder: 'c',
        recipient: 'd',
        maxAmount: 1,
        nonce: 2
      });
    });

    it('should change null recipient to null address', () => {
      bank.createTransfer('a', 'b', 'c', null, 1, 1).recipient
        .should.eq(paradigm.utils.NULL_ADDRESS)
    });
  });

  describe('createSignedTransfer()', () => {
    it('should add a valid Signature to the transfer hash', async () => {
      const transfer = bank.createTransfer(TKA, TKA, accounts[0], TKA, 0, 0);

      const signedTransfer = await bank.createSignedTransfer(transfer);
      signedTransfer.should.contain.keys(transfer);
      signedTransfer.signature.should.contain.keys('v', 'r', 's')
    });
  });
});