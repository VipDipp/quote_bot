const TelegramBot = require('node-telegram-bot-api');
const { choiceOptions, requestOptions, pathOptions } = require('./options')
const rp = require('request-promise');
const fs = require('fs');
const { start } = require('./db');

const { User, Alerts } = require('./model');

require('dotenv').config();
requestOptions.headers['X-CMC_PRO_API_KEY'] = process.env.CMC_API;
let api_response = apiRequest();
api_response = setInterval(apiRequest, 600000);
const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: true });

/*async function b() {
    console.log((await Alerts.find({}))[0].chatID);
}
b();*/


bot.on('message', async msg => {
    const text = msg.text;
    const chatId = msg.chat.id;

    const user = await User.findOne({ chatID: chatId });
    const alerts = await Alerts.findOne({ chatID: chatId });

    try {
        if (text === '/start') {
            const user = new User({ chatID: chatId });
            const alerts = new Alerts({ chatID: chatId });

            await user.save();
            await alerts.save();
            return bot.sendMessage(chatId, `Приветствую, нажмите /info для большей информации`);
        }

        if (text === '/info') {
            return bot.sendMessage(chatId, 'Здесь вы можете проверить котировки интересующего вас инструмента или поставить уведомление на достижении определенной цели', pathOptions);
        }

        if (user.path === 'price') {
            try {
                const currencyId = await getCurrencyID(text);
                user.path = 'main';
                await user.save();
                await bot.sendMessage(chatId, `${getPrice(api_response, currencyId)}`);
            } catch (e) {
                console.log(e);
                return bot.sendMessage(chatId, 'Напиши правильный инструмент');
            }

            return bot.sendMessage(chatId, 'Меню:', pathOptions);
        }

        if (user.path === 'alert') {
            try {
                getCurrencyID(text);
                console.log(alerts.value);
                const arr = await Alerts.findOne({ chatID: chatId });

                arr.value.push(text);
                await arr.save();

                user.path = 'alert2';
                await user.save();

                return bot.sendMessage(chatId, `На каком уровне: (Цена ${text}: ${getPrice(api_response, await getCurrencyID(text))})`);
            } catch (e) {
                console.log(e);
                return bot.sendMessage(chatId, 'Введите правильный инструмент');
            }
        }

        if (user.path === 'alert2') {
            if (isNaN(text)) {
                return bot.sendMessage(chatId, 'Введите число');
            }
            user.path = 'main';
            await user.save();

            const arr = await Alerts.findOne({ chatID: chatId });

            if (getPrice(api_response, await getCurrencyID(arr.value[arr.value.length - 1])) < text) {
                arr.higher.push(true);
            } else {
                arr.higher.push(false);
            }

            arr.alert.push(text);
            await arr.save();
            return bot.sendMessage(chatId, `Готово! Вы получите уведомление когда цена достигнет нужной цены`);
        }

        return bot.sendMessage(chatId, 'Не понял');
    } catch (e) {
        console.log(e);
        return bot.sendMessage(chatId, 'Произошла ошибка');
    }

});

async function apiRequest() {
    api_response = await rp(requestOptions).then(response => {
        return response;
    }).catch((err) => {
        console.log('API call error:', err.message);
    });
    return;
}

function getPrice(res, arg) {
    try {
        return res.data[arg].quote.USD.price;
    } catch (e) {
        console.log('Invalid argument');
    }
}

async function alertCheck() {
    (await Alerts.find({})).forEach(async(model) => {

        const chatid = model.chatId;
        const alert = model.alert;
        const value = model.value;
        const higher = model.higher;
        const length = chatid.length - 1;

        for (let i = 0; i < length; i++) {
            const price = getPrice(api_response, await getCurrencyID(value[i]))
            if ((price > alert[i] && higher) || (price < alert[i] && !higher)) {
                bot.sendMessage(chatId, `Актив ${value[i]} достиг цены в ${alert[i]}!`);
                await alert.splice(i, 1).save();
                await value.splice(i, 1).save();
                await higher.splice(i, 1).save();
                i--;
                length--;
            }
        }

    })
}

async function getCurrencyID(text) {
    return currencyId = Object.keys(api_response.data).find(txt => api_response.data[txt].symbol == text);
}

bot.on('callback_query', async msg => {

    const data = msg.data;
    const chatId = msg.message.chat.id;
    const user = await User.findOne({ chatID: chatId });

    if (data === 'price') {

        user.path = 'price';
        await user.save();
        bot.sendMessage(chatId, 'Напишите какой инструмент вас интересует:');

    }

    if (data === 'alert') {
        user.path = 'alert';
        await user.save();
        return bot.sendMessage(chatId, 'Какой актив вас интересует:');
    }

})

setInterval(alertCheck, 600000)

start();