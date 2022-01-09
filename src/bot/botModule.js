const Alerts = require('../database/model').Alerts;

async function myAlerts(chatId) {
    const alert = await Alerts.findOne({ chatID: chatId });
    const length = alert.alert.length;
    const alerts = alert.alert;
    const value = alert.value;
    const array = [];
    for (let i = 0; i < length; i++) {
        array.push(`${i+1} - ${value[i]}: ${alerts[i]}`);
    }
    return array.join('\n');
}

async function getPrice(res, arg) {
    try {
        return res.data[arg].quote.USD.price;
    } catch (e) {
        console.log('Invalid argument');
    }
}

async function alertCheck(api_response, bot) {
    try {
        (await Alerts.find({})).forEach(async(model) => {

            const chatid = model.chatID;
            const alert = model.alert;
            let length = alert.length;

            for (let i = 0; i < length; i++) {

                const currencyID = await getCurrencyID(await model.value[i], api_response);
                const price = await getPrice(api_response, currencyID);
                if ((price > model.alert[i] && model.higher[i]) || (price < model.alert[i] && !model.higher[i])) {

                    bot.sendMessage(chatid, `Актив ${model.value[i]} достиг цены в ${model.alert[i]}!`);
                    await model.alert.splice(i, 1);
                    await model.value.splice(i, 1);
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
    try {
        const arr = api_response.data;
        return currencyId = Object.keys(arr).find(txt => arr[txt].symbol == text);
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    myAlerts,
    getPrice,
    alertCheck,
    getCurrencyID
}