/*eslint-disable*/

import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51NFLNHSDSxbWb8Acu89mnH8sTsc0V7oH8Kr4UsWmOWMlbRnCZuMpeBWvHFU0A6pou6ePQY5vRY7YPW85odOupQdY00Lu8kZfjZ');

export const bookTour = async tourId => {
    try {
        // 1) Get checkout sessin from API / endpoint
        console.log('tourId',tourId);
        // const session = await axios(`http:127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
        console.log('session', session)
        // 2) create checkout form and charging
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id,
        });
    } catch (error) {
        console.log(error);
        showAlert('error', error)
    }
}