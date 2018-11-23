# OrderGateway

## Overview

The OrderGateway class provides an API for communicating directly with the OrderGateway smart contract on the Ethereum network.

It is used internally by the [`Order` class](https://github.com/ParadigmFoundation/ParadigmConnect/blob/master/lib/docs/Order.md) to implement the `take()`, `isValid()` and `amountRemaining()` methods. It can also be used to find out what `maker` and `taker` arguments a particular subContract expects to receive in order to execute a transaction. 
The OrderGateway exposes the `Participation` event which can be leveraged as a [web3 Event](https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#contract-event)
