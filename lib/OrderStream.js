const fetch = require('node-fetch');
const Order = require('./Order.js');

class OrderStream {

  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async add(order) {
    if(order.recoverPoster() === order.poster) {
      let url = `${this.endpoint}/post`;

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

}

module.exports = OrderStream;
