# ParadigmConnect

ParadigmConnect provides a convenient way to interface with the Paradigm OrderStream and the Paradigm OrderGateway.

## Getting Started

ParadigmConnect is currently only available as a Node.js module. Install with npm:

```
npm install --save paradigm-connect
```

Paradigm is dependent on a `web3` connection, and you will need to require it.

```javascript
const Web3 = require('web3');
const Paradigm = require('paradigm-connect');

web3 = new Web3(web3.currentProvider);

web3.eth.net.getId().then((networkId) => {
  // ... following code goes here.
}
```

## Paradigm

The `Paradigm` class is the top level object through which you will interact with the library. It takes a variety of initialization parameters that you will need to provide.

```javascript
  const paradigm = new Paradigm({ provider: web3.currentProvider, networkId: networkId });
```

## Order

The `Order` class is what you will use to construct and sign orders which you'd like to post to the Paradigm OrderStream to be broadcast to the network.

```javascript
  const Order = paradigm.Order;
  let order = new Order({ ... });
```

The `Order` constructor takes a javascript object that must contain the following things:

- The subcontract address as `subContract`
- The maker's address as `maker`
- The "maker values" object as `makerValues`

Additionally, `makerArguments` and `takerArguments` can be provided or pulled from the SubContract.
