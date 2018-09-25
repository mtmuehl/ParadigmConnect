const Bank = require('./lib/bank');
const Web3 = require('web3');
const OrderGateway = require('./lib/OrderGateway');
const OrderStream = require('./lib/OrderStream.js');
const Order = require('./lib/Order');
const Signature = require('./lib/Signature');
const utils = require('./lib/utils');
const version = require('./package').version;

class Paradigm {
  constructor(options = {}) {
    this.web3 = new Web3(options.provider || new Web3.providers.HttpProvider('https://ropsten.infura.io'));
    options.web3 = this.web3;
    let endpoint                 = options.orderStreamURL || 'https://osd.paradigm.market';
    this.orderStream             = new OrderStream(endpoint);
    this.orderGateway = new OrderGateway(options);
    this.bank = new Bank(this.web3);
    Order.prototype.web3 = this.web3;
    Order.prototype.orderGateway = this.orderGateway;
    this.Order = Order;
    this.utils = utils;
    this.Signature = Signature;
    this.version = version;
  }
};

Paradigm.version = version;

module.exports = Paradigm;