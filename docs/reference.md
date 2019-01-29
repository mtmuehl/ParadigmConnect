---
title: Reference
---

# ParadigmConnect API Reference

## Paradigm

The `Paradigm` class is the top-level module used to interact with the classes and methods discussed below. You can instantiate a `Paradigm` class as follows:

```js
const Paradigm = require("paradigm-connect");
const paradigm = new Paradigm(options);
```

Where `options` is an object with the following:

|Key|Value (JS type)|Remarks/Description|
|-|-|-|
|`networkId`|`number`| Any valid Ethereum network ID (1, 3, 42, etc.)|
|`provider`|`string`|Any valid web3 provider URL, or provider object|
|`endpoint`|`string`|OrderStream node URL (subject to change)|
|`orderGatewayAddress`|`string`|Optional address for the OrderGateway|

An example configuration option (relatively minimal):

```js
const Paradigm = require("paradigm-connect");

// create options object with desired config
const options = {
  networkId: 3,
  provider: "wss://ropsten.infura.io/ws",
  endpoint: "bs2.paradigm.market",
};

// create new instance
const paradigm = new Paradigm(options);

// destructure various classes
const { Order, OrderGateway, OrderStream } = paradigm;
```

## Order

The Order class provides utilities for constructing a properly formatted order to be placed within the Paradigm OrderStream network and to be taken via the OrderGateway smart contract on the Ethereum network.

Additionally, various methods are available to add cryptographic signatures to the order on behalf of different parties.

### Initialization

The Order constructor accepts an options hash (Javascript Object) as an argument which accepts the following parameters:
|Name (key)|JS Type (value)|Remarks/Description|Required|
|-|-|-|-|
|`subContract`|`string`|Ethereum address of the SubContract an order is for|`true`|
|`maker`|`string`|Ethereum address of the maker for an order|`true`|
|`makerArguments`|`array`|SubContract specific arguments for makers (relates to makerValues)|`false`|
|`takerArguments`|`array`|SubContract specific arguments for takers|`false`|
|`makerValues`|`object`|SubContract and order specific values for maker order|`true`|
|`makerSignature`|`object`|Signature object from maker|`false`|
|`posterSignature`|`object`|Signature object from poster entity|`false`|

`makerArguments` and `takerArguments` can either be provided directly, or alternatively, they can automatically be pulled from the subContract if the subContract provides them.

`takerArguments` are optional and can be provided in the event that the entire order is done off chain and added on-chain only as a way to complete the transaction.

A typical order looks like this:

```javascript
  // NOTE: This is an example order. Actual structure of
  // values will vary between different subContracts!

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

Order objects which are created, signed and posted to the OrderStream network will have more data, but that data can also be directly passed into a new Order via the options hash to construct it.

### Signing Orders

#### `make()`

Once an order has been generated, it can be cryptographically signed by calling `order.make()`. The result of this function will be to push `v`, `r`, and `s` values (which represent the signature) to the end of the `makerValues` array.

When the order is taken, this allows subContracts to verify that the order was indeed created by the maker in the order.

Having the order signed by the maker is strictly optional. Some subContracts do not require a signature. For example, 0x orders are already signed before they come into contact with Paradigm. Therefore, the same signature from the 0x order can be used and does not need to be duplicated.

```javascript
  order.make();
  console.log(order.makerValues);
  // => [..., 28, '0x23...', '0x56...']
```

Calling `order.make()` will prompt the user to sign with a tool like MetaMask if they are using a web browser.

#### `prepareForPost()`

The Paradigm OrderStream network requires that anyone posting to the network sign the order. This is in addition to the maker signature, and it is not optional if you want to use the OrderStream network.

It works essentially the same way as `make()`, except it accepts an address as an argument. If no address is provided, it will default to the `maker` address.

Also, it doesn't modify the same datastructure. Instead of updating `makerValues`, it directly sets an attribute called `posterSignature`.

```javascript
  order.prepareForPost('0xF00123Fb59d85e63be29148C4aD582FCEC886B3E');
  console.log(order.posterSignature);
  // => Should render signature data structure
```

### Address Recovery

#### `recoverMaker()`

If an order is signed using the `make()` method, the original maker address can be recovered by calling

```javascript
  order.recoverMaker()
```

This is useful when an order is reconstituted and you want to verify that the maker listed in the order is actually who signed the order.

#### `recoverPoster()`

Description for `recoverMaker()` also applies here:

```javascript
  order.recoverPoster();
```

The Paradigm OrderStream makes use of this method to verify that the poster is a valid address according the the Paradigm governance rules (forthcoming).

### Taking Orders

Taking an order means submitting a transaction to the Ethereum blockchain that fulfills the order. In the case of something like 0x, this means that you are completing a trade. In the case of something like Dharma, this means you are funding a loan.

#### `take()`

The `take()` method requires two arguments: an address for the `taker` and an array of `takerValues`. The `takerValues` array will contain values required by the subContract. In a simple trade, this could just be the number of tokens the taker wishes to purchase.

```javascript
  order.take('0x0988F52Cec741bDfB42aD8D80651005C6D221525', [500]);
```

If in a web browser, this will prompt the taker to submit the transaction with a tool like MetaMask.

#### `estimateGasCost()`

This is a utility method that will estimate the gas cost of `take()`. It requires exactly the same arguments.

```javascript
  order.estimateGasCost('0x0988F52Cec741bDfB42aD8D80651005C6D221525', [500]);
```

### Utilities

#### `toJSON()`

This method will convert the order object into a plain JSON object. The JSON object will be structured so that it can be directly passed back into the `new Order()` function as the options hash to reconstitute the order.

```javascript
  let json = order.toJSON();
  let newOrder = new Order(json);
```

We use this function internally, and it can be useful in cases where you'd like to do something like store orders in your own database. You could easily drop the JSON version of the orders directly into something like Redis, and then you could convert it back into an order object whenever you need to use it.

## OrderStream

The OrderStream class provides two simple utilities for interacting with the Paradigm OrderStream network.

First of all, it provides a simple mechanism for adding new orders to the stream. It also provides a simple way to listen (via WebSockets) to new orders being added to the stream.

### Initialization

The OrderStream constructor accepts one argument: a Paradigm OrderStream `endpoint`.

```javascript
  let orderStream = new OrderStream('os1.paradigm.market');
```

The `ParadigmConnect` library actually instantiates a connection to the OrderStream on load. The standard way to set an OrderStream endpoint would be to pass it into the Paradigm constructor.

```javascript
  let paradigm = new Paradigm({ ..., orderStreamURL: 'os2.paradigm.market' });
  let orderStream = paradigm.orderStream;
```

This attaches an `orderStream` attribute to the `paradigm` object.

### Adding Orders to the Order Stream

#### `add()`

Once you have [prepared an order to be posted](https://github.com/ParadigmFoundation/ParadigmConnect/blob/master/lib/docs/Order.md#prepareforpost), you can add it to the Order Stream by calling:

```javascript
  orderStream.add(order);
```

A simple, full example of making an order, preparing it to be posted, and adding to the OrderStream looks like:

```javascript
  order.make().then(() => {
    order.prepareForPost(currentUser).then(() => {
      orderStream.add(order);
    })
  });
```

If the request is successful, you will get back JSON which contains the OrderStream ID as well as the raw data for the order.

### Listening to the Order Stream

#### `listen()`

You can listen to the OrderStream by calling `listen` and then providing a callback function. For example:

```javascript
  orderStream.listen((order) => {
    console.log(order);
  });
```

This provides you an easy way to subscribe to the OrderStream and handle the data any way you wish: adding it to a UI, database, or elsewhere.

## OrderGateway

The OrderGateway class provides an API for communicating directly with the OrderGateway smart contract on the Ethereum network.

It is used internally by the [`Order` class](https://github.com/ParadigmFoundation/ParadigmConnect/blob/master/lib/docs/Order.md) to implement the `take()`, `isValid()` and `amountRemaining()` methods. It can also be used to find out what `maker` and `taker` arguments a particular subContract expects to receive in order to execute a transaction. 

The OrderGateway exposes the `Participation` event which can be leveraged as a [web3 Event](https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#contract-event)

## Signature

Internal class used by `Order`,  reference coming soon. 