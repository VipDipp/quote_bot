const TelegramBot = require('node-telegram-bot-api');
const { choiceOptions, requestOptions, pathOptions } = require('./options')
const rp = require('request-promise');
const fs = require('fs');
const { start } = require('./db');
const User = require('./model');
require('dotenv').config();
requestOptions.headers['X-CMC_PRO_API_KEY'] = process.env.CMC_API;

let api_response = setInterval(apiRequest, 600000);
const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async msg => {
    const text = msg.text;
    const chatId = msg.chat.id;
    const user = await User.findOne({ chatID: chatId });

    try {
        if (text === '/start') {
            const user = new User({ chatID: chatId });
            await user.save();
            return bot.sendMessage(chatId, `Приветствую, нажмите /info для большей информации`);
        }

        if (text === '/info') {
            return bot.sendMessage(chatId, 'Здесь вы можете проверить котировки интересующего вас инструмента или поставить уведомление на достижении определенной цели', pathOptions);
        }

        if (user.path === 'price') {
            const user = await User.findOne({ chatID: chatId });
            try {
                await apiRequest();
                const currencyId = Object.keys(api_response.data).find(txt => api_response.data[txt].symbol == text);
                user.path = 'main';
                await user.save();
                await bot.sendMessage(chatId, `${api_response.data[currencyId].quote.USD.price}`);
            } catch (e) {
                console.log(e);
                return bot.sendMessage(chatId, 'Напиши правильный инструмент');
            }
            return bot.sendMessage(chatId, 'Меню:', pathOptions);
        }

        return bot.sendMessage(chatId, 'Не понял');
    } catch (e) {
        console.log(e);
        return bot.sendMessage(chatId, 'Произошла ошибка');
    }

});

async function apiRequest() {
    api_response = await rp(requestOptions).then(response => {
        //console.log('API call response:', response);
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

bot.on('callback_query', async msg => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    if (data === 'price') {
        const user = await User.findOne({ chatID: chatId });
        user.path = 'price';
        await user.save();
        bot.sendMessage(chatId, 'Напишите какой инструмент вас интересует:');

    }

    if (data === 'alert') {
        path = 'alert';
        botOnAlert();
    }

    /*apiRequest()
        .then(() => {
            const text = getPrice(api_response, data);
            return bot.sendMessage(chatId, `${text}`);
        }).catch((e) => {
            console.log(e);
        })*/

})

start();