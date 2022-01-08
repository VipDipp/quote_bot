const cmcApi = require('../config').cmcApi;

pathOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{ text: 'Цены', callback_data: 'price' }],
            [{ text: 'Уведомление', callback_data: 'alert' }]
        ]
    })
}

requestOptions = {
    method: 'GET',
    uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
    qs: {
        'start': '1',
        'limit': '10',
        'convert': 'USD'
    },
    headers: {
        'X-CMC_PRO_API_KEY': cmcApi
    },
    json: true,
    gzip: true
}

module.exports = {
    pathOptions,
    requestOptions
}