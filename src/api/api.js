const rp = require('request-promise');
const requestOptions = require('../options').requestOptions;

async function apiRequest() {
    const api_request = await rp(requestOptions).then(response => {
        return response;
    }).catch((err) => {
        console.log('API call error:', err.message);
    });
    return api_request;
}

module.exports = {
    apiRequest
}