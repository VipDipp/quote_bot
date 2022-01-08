const Alerts = require('../database/model').Alerts;
const bot = require('./bot');

async function getPrice(res, arg) {
    try {
        return res.data[arg].quote.USD.price;
    } catch (e) {
        console.log('Invalid argument');
    }
}

async function alertCheck(api_response) {
    console.log('here');
    try {
        (await Alerts.find({})).forEach(async(model) => {

            const chatid = model.chatID;
            const alert = model.alert;
            let length = alert.length;

            for (let i = 0; i < length; i++) {
                const price = await getPrice(api_response, await getCurrencyID(model.value[i], api_response));
                console.log(price);
                console.log(model.alert[i]);
                if ((price > model.alert[i] && model.higher[i]) || (price < model.alert[i] && !model.higher[i])) {
                    bot.sendMessage(chatid, `Актив ${model.value[i]} достиг цены в ${model.alert[i]}!`);
                    await model.alert.splice(i, 1);
                    await model.save();
                    await model.value.splice(i, 1);
                    await model.save();
                    await model.higher.splice(i, 1);
                    await model.save();
                    i--;
                    length--;
                }
            }

        })
    } catch (e) {
        console.log(e);
    }
}

async function getCurrencyID(text, api_response) {
    return currencyId = Object.keys(api_response.data).find(txt => api_response.data[txt].symbol == text);
}

module.exports = {
    getPrice,
    alertCheck,
    getCurrencyID
}