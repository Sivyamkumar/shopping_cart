/** Publishable key is not secret, it's ok to store it here.
 * Check https://stripe.com/docs/keys
 */
const publishableKey = typeof stripePublishableKey !== 'undefined' ? stripePublishableKey : 'pk_test_placeholder';
// your public key should be here for proper Stripe work
// otherwise app generates en error with alert message

if (!publishableKey || publishableKey === 'pk_test_placeholder') {
    console.warn('Please add a valid Stripe.js public key to your .env file');
}

const stripe = Stripe(publishableKey);
const elements = stripe.elements();

// Create an instance of the card Element
const card = elements.create('card', {
    style: {
        base: {
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#aab7c4'
            }
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
        }
    }
});

// Add an instance of the card Element into the `card-element` <div>
card.mount('#card-element');

const $form = $('#checkout-form');

$form.submit(async function (event) {
    event.preventDefault();
    $('#charge-error').addClass('invisible');
    $form.find('button').prop('disabled', true);

    const {token, error} = await stripe.createToken(card);

    if (error) {
        // Inform the user if there was an error
        $('#charge-error').text(error.message);
        $('#charge-error').removeClass('invisible');
        $form.find('button').prop('disabled', false);
    } else {
        // Send the token to your server
        stripeResponseHandler(token);
    }
});

function stripeResponseHandler(token) {
    // Insert the token ID into the form so it gets submitted to the server
    $form.append($('<input type="hidden" name="stripeToken" />').val(token.id));
    // Submit the form
    $form.get(0).submit();
}
