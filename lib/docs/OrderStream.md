# OrderStream

## Overview

The OrderStream class provides two simple utilities for interacting with the Paradigm OrderStream network.

First of all, it provides a simple mechanism for adding new orders to the stream. It also provides a simple way to listen (via WebSockets) to new orders being added to the stream.

## Reference

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

If the request is successful, you will get back JSON which contains the OrderStream ID as well as the raw data for the order.

### Listening to the Order Stream

You can listen to the OrderStream by calling `listen` and then providing a callback function. For example:

```javascript
  orderStream.listen((order) => {
    console.log(order);
  });
```

This provides you an easy way to subscribe to the OrderStream and handle the data any way you wish: adding it to a UI, database, or elsewhere.
