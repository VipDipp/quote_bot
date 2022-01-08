const TelegramBot = require('node-telegram-bot-api');
const onMessage = require('./onMessage');
const onQuery = require('./onQuery');
const apiRequest = require('../api/api').apiRequest;
const start = require('../database/db').start;

const token = require('../../config').botToken;
const bot = new TelegramBot(token, { polling: true });

const alertCheck = require('./botModule').alertCheck;

const request = async() => {
    const api_response = await apiRequest();

    bot.on('message', async msg => await onMessage(msg, api_response, bot));
    bot.on('callback_query', async msg => await onQuery(msg, bot));

    alertCheck(api_response);

}

setInterval(request, 600000);
request();
start();