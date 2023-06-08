/* eslint-disable */
import axios from "axios";
import { showAlert } from './alerts'

export const updateSettings = async (data, type) => {
    try {
        const url = type === 'password' ? '/api/v1/users/updateMyPassword' : '/api/v1/users/updateMe';
        const res = await axios({
            method: 'PATCH',
            url,
            data
        });
        if (res.data.status === 'success') {
            showAlert('success', `${type} updated successfully!`);
        }
        location.reload(true); // this helps to reload the page immediately after the photo uploaded
        return res;
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};