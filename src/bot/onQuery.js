const User = require('../database/model').User;

async function onQuery(msg, bot) {
    try {

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
    } catch (e) {
        console.log(e);
    }
}

module.exports = onQuery;