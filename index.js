const TelegramBot = require('node-telegram-bot-api');
const { choiceOptions, requestOptions, pathOptions } = require('./options')
const rp = require('request-promise');
const fs = require('fs');
const { start } = require('./db');
const User = require('./model');
require('dotenv').config();
requestOptions.headers['X-CMC_PRO_API_KEY'] = process.env.CMC_API;

let path;
let api_response;
const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async msg => {
    const text = msg.text;
    const chatId = msg.chat.id;

    try {
        if (text === '/start') {
            const user = new User({ chatID: chatId });
            await user.save();
            return bot.sendMessage(chatId, `Приветствую, нажмите /info для большей информации`, choiceOptions);
        }
        if (text === '/info') {
            return bot.sendMessage(chatId, 'Здесь вы можете проверить котировки интересующего вас инструмента или поставить уведомление на достижении определенной цели', pathOptions);
        }
        return bot.sendMessage(chatId, 'Не понял');
    } catch (e) {
        return bot.sendMessage(chatId, 'Произошла какая то ошибочка!)');
    }

});

async function apiRequest() {
    api_response = await rp(requestOptions).then(response => {
        console.log('API call response:', response);
        return response;
    }).catch((err) => {
        console.log('API call error:', err.message);
    });
    console.log(api_response);
    return;
}

function getPrice(res, arg) {
    try {
        return res.data[arg].quote.USD.price;
    } catch (e) {
        console.log('Invalid argument');
    }
}

function botOnAlert() {

}

function botOnPrice() {

}

bot.on('callback_query', async msg => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    console.log(data);

    if (data === 'price') {
        path = 'price';
        botOnPrice();
    }

    if (data === 'alert') {
        path = 'alert';
        botOnAlert();
    }

    apiRequest()
        .then(() => {
            const text = getPrice(api_response, data);
            return bot.sendMessage(chatId, `${text}`);
        }).catch((e) => {
            console.log(e);
        })
})

start();