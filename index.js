require('dotenv').config();

let keep_alive;
if (process.env.KEEP_ALIVE === 'true') {
    // Require keep_alive.js to continue working in Replit env:
    // https://docs.replit.com/tutorials/nodejs/build-basic-discord-bot-nodejs#keeping-our-bot-alive
    keep_alive = require('./keep_alive.js');
}

const express = require('express');
const app = express();

app.use(express.static('src'));  
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Init MidTrans
const midtransClient = require('midtrans-client');
let snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});


// app.get('/action', (req, res) => {
//   res.json({ message: 'Action was triggered!' });
// });

// Create a route to handle the booking
app.post('/book', async (req, res) => {
    let { email, price, fee, totalPrice } = req.body;
    let transaction = {
        transaction_details: {
            order_id: 'order-' + new Date().getTime(),
            gross_amount: totalPrice
        },
        credit_card: {
            secure: true
        },
        customer_details: {
            email
        },
        item_details: [
            {
                id: 'item-booking-'  + new Date().getTime(), 
                price: price,
                quantity: 1,
                name: 'Booking of the court at Love Tennis Academy',
                brand: 'Love Tennis Academy',
                category: 'Sports',
                merchant_name: 'Love Tennis Academy'
            },
            {
                id: 'item-fee-'  + new Date().getTime(), 
                price: fee,
                quantity: 1,
                name: 'Liga App fee',
                brand: 'Love App',
                category: 'Sports',
                merchant_name: 'Liga App'
            },
        ],
    };
    try {
        let snapToken = await snap.createTransaction(transaction);
        res.json(snapToken);
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

// Setup the webhook to listen for Midtrans events
app.post('/webhook', (req, res) => {
    let event = req.body;
    // Process the event accordingly
    res.status(200).send();
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
