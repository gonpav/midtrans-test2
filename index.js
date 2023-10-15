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
    const now = new Date()
    const orderId = now.getTime();
    let { email, courtPrice, platformFee, totalPrice, paymentOptions, platformFeePercentage, paymentOptionPercentage } = req.body;
    //console.log(paymentOption);
    //res.status(500).send("Just exit");
    //return;
    let transaction = {
        transaction_details: {
            order_id: 'order-' + orderId,
            gross_amount: totalPrice
        },
        enabled_payments: paymentOptions, // ["bank_transfer"],
        credit_card: {
            secure: true
        },
        customer_details: {
            email
        },
        expiry:  {
            start_time: now,
            unit: "minutes",
            duration: 15        // wait for 15 minutes for transaction to complete
        },
        expiry:  {
            unit: "minutes",
            duration: 14        // show snap for 14 minutes 
        },
        item_details: [
            {
                id: 'item-booking-'  + orderId, 
                price: courtPrice, 
                quantity: 1,
                name: 'Booking of the court at Love Tennis Academy',
                brand: 'Love Tennis Academy',
                category: 'Sports',
                merchant_name: 'Love Tennis Academy'
            },
            {
                id: 'item-fee-'  + orderId, 
                price: platformFee,
                quantity: 1,
                name: 'Pltaform fee ' + platformFeePercentage,
                brand: 'Love App',
                category: 'Sports',
                merchant_name: 'Liga App'
            },
            {
                id: 'item-midtrans-'  + orderId, 
                price: totalPrice - (courtPrice + platformFee),
                quantity: 1,
                name: 'Mindtrans fee ' + paymentOptionPercentage,
                brand: 'Midtrans',
            },            
        ],
    };
    try {
        let snapToken = await snap.createTransaction(transaction);
        res.json({snapToken: snapToken, paymentOptions: paymentOptions});
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
