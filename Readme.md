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

```

```
