const PosterRegistry = require('./lib/PosterRegistry');
const OrderStream = require('./lib/OrderStream.js');
const OrderGateway = require('./lib/OrderGateway');
const Signature = require('./lib/Signature');
const version = require('./package').version;
const DigmToken = require('./lib/DigmToken');
const Treasury = require('./lib/Treasury');
const Order = require('./lib/Order');
const utils = require('./lib/utils');
const Web3 = require('web3');


class Paradigm {
  constructor(options = {}) {
    //Configuring web3
    this.web3 = new Web3(options.provider || new Web3.providers.HttpProvider('https://ropsten.infura.io'));
    options.web3 = this.web3;

    //Initializing contract objects
    this.orderGateway = new OrderGateway(options);
    this.digmToken = new DigmToken(options);
    this.treasury = new Treasury(options, this.digmToken);
    this.posterRegistry = new PosterRegistry(options, this.treasury);

    //Bootstrapping Order object
    Order.prototype.web3 = this.web3;
    Order.prototype.orderGateway = this.orderGateway;
    this.Order = Order;

    //Configuring OrderStream
    let endpoint = options.orderStreamURL || 'bs2.paradigm.market';
    this.orderStream = new OrderStream(endpoint);

    //Utilities
    this.version = version;
    this.utils = utils;
    this.Signature = Signature;
  }
}

Paradigm.version = version;

module.exports = Paradigm;
