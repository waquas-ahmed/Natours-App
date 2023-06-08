/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email,
                password
            }
        });
        console.log('response', res);

        if (res.data.message === 'success') {
            showAlert('success', 'Logged In successfully');
            window.setTimeout(() => {
                location.assign('/')
            }, 1500)
        }
    } catch (error) {
        // console.log(error.response)
        showAlert('error', error.response.data.message);
    }

}

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: '/api/v1/users/logout'
        });
        console.log('response', res.data.status);

        if (res.data.status === 'success')
            location.reload(true);

    } catch (error) {
        // console.log(error.response)
        showAlert('error', 'Error logging out Try again!!');
    }

}
