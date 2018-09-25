const Paradigm = require('../index');

describe('Paradigm', () => {
  describe('constructor()', () => {
    it("should create an ropsten infura web3 when no provider is given", async () => {
      const testParadigm = new Paradigm();

      testParadigm.should.be.instanceOf(Paradigm);
      (await testParadigm.web3.eth.net.getId()).should.eq(3)
    });
  });
});
