const OrderGateway = require('../lib/OrderGateway');
const OrderGatewayContract = require('paradigm-core-solidity/build/contracts/OrderGateway');


describe('OrderGateway', () => {
  let orderGateway;

  before(() => {
    orderGateway = paradigm.orderGateway;
  });

  describe('participate()', () => {
    it('should participate in a fully constructed Order.');
  });

  describe('makerArguments()', () => {
    it('should get the makerArguments of a SubContract', async () => {
      const makerArguments = await orderGateway.makerArguments(subContract);
      assert.doesNotThrow(() => { JSON.parse(makerArguments) });
    });
  });

  describe('takerArguments()', () => {
    it('should get the takerArguments of a SubContract', async () => {
      const takerArguments = await orderGateway.takerArguments(subContract);
      assert.doesNotThrow(() => { JSON.parse(takerArguments) });
    });
  });

  describe('constructor()', () => {
    it("should deploy a new contract if configuration doesn't point to a network with a deployed contract.", async () => {
      await orderGateway.initializing;
      const deployedAddress = orderGateway.address;

      const testOrderGateway = new OrderGateway({ web3, networkId: 123 });
      await testOrderGateway.initializing;

      deployedAddress.should.not.equal(testOrderGateway.address);
    });

    it("should select an existing contract if the core has been deployed to the network.", async () => {
      await orderGateway.initializing;
      const deployedAddress = orderGateway.address;

      const testOrderGateway = new OrderGateway({ web3, networkId: 3 });
      await testOrderGateway.initializing;

      deployedAddress.should.not.equal(testOrderGateway.address);
      testOrderGateway.address.should.equal(OrderGatewayContract.networks[3].address);
    });

    it("should select an existing contract if the options provide address.", async () => {
      await orderGateway.initializing;
      const deployedAddress = orderGateway.address;

      const testOrderGateway = new OrderGateway({ web3, orderGatewayAddress: deployedAddress });
      await testOrderGateway.initializing;

      deployedAddress.should.equal(testOrderGateway.address);
    });
  });
});