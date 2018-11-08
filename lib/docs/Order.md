# Order

## Overview

The Order class provides utilities for constructing a properly formatted order to be placed within the Paradigm OrderStream network and to be taken via the OrderGateway smart contract on the Ethereum network.

Additionally, various methods are available to add cryptographic signatures to the order on behalf of different parties.

## Reference

### Initialization

The Order constructor accepts an options hash as an argument which accepts the following parameters:
- subContract
- maker
- makerArguments
- takerArguments
- makerValues
- makerSignature
- posterSignature

`makerArguments` and `takerArguments` can either be provided directly, or alternatively, they can automatically be pulled from the subContract if the subContract provides them.

`takerArguments` are optional and can be provided in the event that the entire order is done off chain and added on-chain only as a way to complete the transaction.

A typical order looks like this:

```javascript
  // NOTE: This is an example order. Actual structure of
  //       values will vary between different subContracts!
  const Order = paradigm.Order;
  let order = new Order({
    subContract: '0xE0183d68d292d617c1f10900C28dC9F280608d9A',
    maker: '0xD78d21C3E3CFB348C5ec5DF3Ad0De81d3d43b2C7',
    makerValues: [
      '0xD78d21C3E3CFB348C5ec5DF3Ad0De81d3d43b2C7', // Maker address
      7000,                                         // Quantity to buy
      25,                                           // Quantity to sell
      '0xe41d2489571d322189246dafa5ebde1f4699f498', // Address of token to buy
      '0x2956356cd2a2bf3202f771f50d3d14a367b48070'  // Address of token to sell
    ]
  });
```
