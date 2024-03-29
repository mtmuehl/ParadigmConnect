const WebSocket = require('isomorphic-ws');
const fetch = require('node-fetch');
const Order = require('./Order.js');

class OrderStream {

  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async add(order) {
    if(order.recoverPoster().toLowerCase() === order.poster.toLowerCase()) {
      let url = `https://${this.endpoint}/post`;

      let response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(order),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return await response.json();
    } else {
      throw new Error('The order is not signed for posting.')
    }
  }

  listen(callback) {
    let url = `wss://${this.endpoint}/stream`;
    let ws = new WebSocket(url);
    ws.onmessage = function incoming(data) {
      callback(data);
    }
  }



}

module.exports = OrderStream;
