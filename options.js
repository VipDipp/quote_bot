module.exports = {
    choiceOptions: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: 'Bitcoin', callback_data: '0' }],
                [{ text: 'Etherium', callback_data: '1' }],
                [{ text: 'BNB', callback_data: '2' }]
            ]
        })
    },
    pathOptions: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: 'Цены', callback_data: 'price' }],
                [{ text: 'Уведомление', callback_data: 'alert' }]
            ]
        })
    },
    requestOptions: {
        method: 'GET',
        uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
        qs: {
            'start': '2',
            'limit': '1',
            'convert': 'USD'
        },
        headers: {
            'X-CMC_PRO_API_KEY': ''
        },
        json: true,
        gzip: true
    }
}