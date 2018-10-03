describe('OrderStream', () => {
  let maker, taker, order, orderGateway, bank, Signature;

  before(async () => {
    bank = paradigm.bank;
    Signature = paradigm.Signature;
    Order = paradigm.Order;
    orderGateway = paradigm.orderGateway;
    orderStream = paradigm.orderStream;

    maker = accounts[7].toLowerCase();
    taker = accounts[8].toLowerCase();
    let makerArguments = await orderGateway.makerArguments(subContract);
    let takerArguments = await orderGateway.takerArguments(subContract);

    await bank.giveMaxAllowanceFor(TKA, subContract, maker);
    await bank.giveMaxAllowanceFor(TKB, subContract, taker);

    let makerValues = {
      signer: maker,
      signerToken: TKA,
      signerTokenCount: 1000,
      buyer: taker,
      buyerToken: TKB,
      buyerTokenCount: 1000,
    };

    order = new paradigm.Order({ subContract, maker: maker, makerArguments, takerArguments, makerValues });
    await order.make();

    console.log("OS: ", order)
  });

  it('should post to the OS', async () => {
    await order.prepareForPost(maker);
    orderStream.add(order);
  });

});
