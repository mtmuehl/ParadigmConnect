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
