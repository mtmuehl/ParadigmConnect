---
title: Overview
---

# ParadigmConnect

ParadigmConnect is the primary library for interacting with the Paradigm protocol and settlement platform. It is currently only available in JavaScript. ParadigmConnect provides a convenient way to interface with the Paradigm OrderStream and the Paradigm OrderGateway.

Jump into ParadigmConnect by following one of the links below:
- [Quick start](./getting-started.md)
- [Full API reference](./reference.md)
- [Usage examples](./usage.md)
- [Source code (on GitHub)](https://github.com/ParadigmFoundation/ParadigmConnect)

## Current features

ParadigmConnect provides client and server-side utilities for the following actions (all of which can be configured for local and remote OrderStream nodes):

- Constructing and signing maker orders
- Signing orders as a poster (for OrderStream submission)
- Submitting orders to the OrderStream via RPC
- Subscribing to the OrderStream to parse/process orders

## Proposed features

In the future, the library (or related tooling) may be extended to support:

- Locking tokens to gain write access to the OrderStream
- Auditing nodes and validators on the network
- Submitting applications for validators
- Voting on validator applications

Until then, the above actions must be taken programmatically through libraries such as `web3`, or interacting with the Paradigm contract system's interfaces manually on services like [Etherscan](https://etherscan.io)

## Issues and proposals
ParadigmConnect is under active development, and at this point should not be considered stable. If you find a bug, inconsistency, or vulnerability please open an issue.

If you encounter errors setting up or running setting up ParadigmConnect, feel free to reach out on our [chat server.](https://chat.paradigm.market/)

ParadigmConnect is open source software, and we encourage the suggestion of improvements and enhancements to the protocol. If you have a suggestion or specification, please submit a Paradigm Improvement Proposal (PIP) or open a pull request.