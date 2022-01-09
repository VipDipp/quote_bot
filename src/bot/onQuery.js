const User = require('../database/model').User;
const myAlerts = require('./botModule').myAlerts;

async function onQuery(msg, bot) {
    try {

        const data = msg.data;
        const chatId = msg.message.chat.id;
        const user = await User.findOne({ chatID: chatId });

        const paths = {

            'price': async() => {
                user.path = 'price';
                await user.save();
                bot.sendMessage(chatId, 'Напишите какой инструмент вас интересует:');
            },

            'alert': async() => {
                user.path = 'alert';
                await user.save();
                return bot.sendMessage(chatId, 'Какой актив вас интересует:');
            },

            'myAlerts': async() => {
                const arr = await myAlerts(chatId);
                return bot.sendMessage(chatId, arr);
            },

            'back': async() => {
                user.path = 'main';
            }

        }

        paths[data]();

    } catch (e) {
        console.log(e);
    }
}

module.exports = onQuery;