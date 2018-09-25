const fetch = require('node-fetch');
const Order = require('./Order.js');

class OrderStream {

  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async add(order) {
    if(order.recoverPoster() === order.poster) {
      let url = `${this.endpoint}/api/post`;

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

  async find(id) {
    let url = `${this.endpoint}/api/order/${id}`;

    let response  = await fetch(url);
    let json      = await response.json();

    let orderData = json[0];
    let order     = new Order(orderData.data);

    return order;
  }

}

module.exports = OrderStream;
