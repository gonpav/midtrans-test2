document.getElementById('price').addEventListener('input', updateSummary);
document.getElementById('fee').addEventListener('input', updateSummary);
document.getElementById('book-button').addEventListener('click', bookCourt);

function paymentOptionSelected() {
    updateSummary();
    return 1;
}

function getCourtPrice () {
    // const courtPrice = document.getElementById('price').value;
    // return parseInt(courtPrice);
    return parseFloat(document.getElementById('price').value);
}

function getPlatformFee () {
    // const fee = document.getElementById('fee').value;
    // return parseInt(fee);
    return  parseFloat(document.getElementById('fee').value);
}

function getPaymentOptionTotal(selectedOption) {
    const courtPrice = getCourtPrice();
    const fee = getPlatformFee();
    const total = courtPrice + fee;

    let paymentTotal;

    switch(selectedOption) {
        case 'credit-card':
            paymentTotal = total + total * 0.026 + 1332;
            break;
        case 'bank-transfer':
            paymentTotal = total + 3330;
            break;
        case 'gopay':
            paymentTotal = total + total * 0.10;
            break;
        case 'shopeepay':
            paymentTotal = total + total * 0.04;
            break;
        case 'qris':
            paymentTotal = total + total * 0.007;
            break;
        case 'indomaret':
            paymentTotal = total + 1110;
            break;
        case 'alfamart':
            paymentTotal = total + 5000;
            break;
        case 'kredivo':
            paymentTotal = total + total * 0.0222;
            break;
        case 'akulaku':
            paymentTotal = total + total * 0.017;
            break;
        default:
            console.error('Unknown payment option:', selectedOption);
            return;
    }

    return paymentTotal;
}

function getTotalPrice () {
    const selectedOption = document.querySelector('input[name="payment-option"]:checked').value;
    return getPaymentOptionTotal(selectedOption);
}

function updateSummary() {

    document.getElementById('credit-card-amount').textContent = getPaymentOptionTotal('credit-card').toFixed(0);
    document.getElementById('bank-transfer-amount').textContent = getPaymentOptionTotal('bank-transfer').toFixed(0);
    document.getElementById('gopay-amount').textContent = getPaymentOptionTotal('gopay').toFixed(0);
    document.getElementById('shopeepay-amount').textContent = getPaymentOptionTotal('shopeepay').toFixed(0);
    document.getElementById('qris-amount').textContent = getPaymentOptionTotal('qris').toFixed(0);
    document.getElementById('indomaret-amount').textContent = getPaymentOptionTotal('indomaret').toFixed(0);
    document.getElementById('alfamart-amount').textContent = getPaymentOptionTotal('alfamart').toFixed(0);
    document.getElementById('kredivo-amount').textContent = getPaymentOptionTotal('kredivo').toFixed(0);
    document.getElementById('akulaku-amount').textContent = getPaymentOptionTotal('akulaku').toFixed(0);
    
    document.getElementById('total').innerText = getTotalPrice().toFixed(2);   

    updateFees();
}

function updateFees() {

    const courtPrice = getCourtPrice();
    const fee = getPlatformFee();
    const total = courtPrice + fee;
    const paymentTotal = getTotalPrice();
    
    const platformFee = (fee * 100) / courtPrice;
    const paymentOptionFee = ((paymentTotal - total) / total) * 100;
    const totalFee = ((paymentTotal - courtPrice)/ courtPrice) * 100;

    document.getElementById('fee-percentage-value').innerText = ` ${platformFee.toFixed(2)}%`;
    document.getElementById('payment-option-fee-percentage-value').innerText = ` ${paymentOptionFee.toFixed(2)}%`;
    document.getElementById('total-additional-charges-percentage-value').innerText = ` ${totalFee.toFixed(2)}%`;
}

function bookCourt() {
    console.log('Book Court pressd');
    const email = document.getElementById('email').value;
    const courtPrice = getCourtPrice();
    const fee = getPlatformFee ();
    const totalPrice = getTotalPrice();
    const paymentOption = document.querySelector('input[name="payment-option"]:checked').value;
    
    fetch('/book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            price: courtPrice,
            fee: fee,
            totalPrice: totalPrice,
            paymentOption: paymentOption,
        })
    })
    .then(response => response.json())
    .then(data => {
        snap.pay(data.token, {
            onSuccess: function(result) {
                updateTransactions(result);
            },
            onPending: function(result) {
                console.log(result);
            },
            onError: function(result) {
                console.error(result);
            }
        });
    })
    .catch(error => console.error('Error:', error));
}

function updateTransactions(transaction) {
    // Update the transactions table with the new transaction data
    console.log(transaction);
}

updateSummary();