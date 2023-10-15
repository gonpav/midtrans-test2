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

function getPlatformFeePercentage () {
    const courtPrice = getCourtPrice();
    const fee = getPlatformFee();
    
    const platformFee = (fee * 100) / courtPrice;
    return platformFee;
}

function getPaymentOptionPercentage () {
    const courtPrice = getCourtPrice();
    const fee = getPlatformFee();
    const total = courtPrice + fee;
    const paymentTotal = getTotalPrice();
    
    const paymentOptionFee = ((paymentTotal - total) / total) * 100;
    return paymentOptionFee;
}

function getTotalAdditionalChargesPercentage () {
    const courtPrice = getCourtPrice();
    const fee = getPlatformFee();
    const paymentTotal = getTotalPrice();
    
    const totalFee = ((paymentTotal - courtPrice)/ courtPrice) * 100;
    return totalFee;
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

    document.getElementById('fee-percentage-value').innerText = ` ${getPlatformFeePercentage().toFixed(2)}%`;
    document.getElementById('payment-option-fee-percentage-value').innerText = ` ${getPaymentOptionPercentage().toFixed(2)}%`;
    document.getElementById('total-additional-charges-percentage-value').innerText = ` ${getTotalAdditionalChargesPercentage().toFixed(2)}%`;
}

function isMobileVersion() {
    // This esential to correctly identify if we are in mobile to switch to GoPay and ShopeePay apps 
    
    // https://docs.midtrans.com/docs/technical-faq#does-midtrans-support-flutter-react-native-or-other-hybridnon-native-mobile-framework
    // https://docs.midtrans.com/docs/technical-faq#customer-fails-to-be-redirected-to-gojek-deeplink-on-mobile-app-what-should-i-do
    
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent);
    return isMobile;
}

function getSelectedMidtransPaymentOptions() {
    const isMobile = isMobileVersion();
    const paymentOption = document.querySelector('input[name="payment-option"]:checked').value;
    if (paymentOption === 'credit-card') return ['credit_card'];
    if (paymentOption === 'bank-transfer') return ['bank_transfer', 'other_va'];
    if (paymentOption === 'qris' && isMobile) return ["other_qris"];
    if (paymentOption === 'qris' && !isMobile) return ["other_qris", "gopay", "shopeepay"];
    return  [`${paymentOption}`];
}

function bookCourt() {
    console.log('Book Court pressd');
    const email = document.getElementById('email').value;
    const courtPrice = getCourtPrice();
    const platformFee = getPlatformFee ();
    const totalPrice = getTotalPrice();
    const platformFeePercentage = `(${getPlatformFeePercentage ().toFixed(0)}%)`;
    const paymentOptionPercentage = `(${getPaymentOptionPercentage().toFixed(0)}%)`;
    const paymentOptions = getSelectedMidtransPaymentOptions();
    
    fetch('/book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            courtPrice: courtPrice,
            platformFee: platformFee,
            totalPrice: totalPrice,
            paymentOptions: paymentOptions,
            platformFeePercentage: platformFeePercentage,
            paymentOptionPercentage: paymentOptionPercentage,
        })
    })
    .then(response => response.json())
    .then(data => {
        let options = {
            uiMode: 'auto'
        };
        if (data.paymentOptions.includes("gopay") || data.paymentOptions.includes("shopeepay")){
            options.uiMode = isMobileVersion() ? 'deeplink' : 'qr';
        }
        snap.pay(data.snapToken.token, options, {
            onSuccess: function(result) {
                updateTransactions(result);
            },
            onPending: function(result) {
                console.log(result);
            },
            onError: function(result) {
                console.error(result);
            },
            onClose: function(){
                console.log('customer closed the popup without finishing the payment');
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