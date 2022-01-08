const { User, Alerts } = require('../database/model');
const { getPrice, alertCheck, getCurrencyID } = require('./botModule');

const pathOptions = require('../options').pathOptions;

async function onMessage(msg, api_response, bot) {

    console.log(1);

    const text = msg.text;
    const chatId = msg.chat.id;

    const user = await User.findOne({ chatID: chatId });
    const alerts = await Alerts.findOne({ chatID: chatId });

    console.log(text);

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
                console.log(api_response);
                const currencyId = await getCurrencyID(text, api_response);
                user.path = 'main';
                await user.save();
                await bot.sendMessage(chatId, `${await getPrice(api_response, currencyId)}`);
            } catch (e) {
                console.log(e);
                return bot.sendMessage(chatId, 'Напиши правильный инструмент');
            }

            return bot.sendMessage(chatId, 'Меню:', pathOptions);
        }

        if (user.path === 'alert') {
            try {
                await getCurrencyID(text, api_response);
                console.log(alerts.value);
                const arr = await Alerts.findOne({ chatID: chatId });

                arr.value.push(text);
                await arr.save();

                user.path = 'alert2';
                await user.save();

                return bot.sendMessage(chatId, `На каком уровне: (Цена ${text}: ${await getPrice(api_response, await getCurrencyID(text))})`);
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

            if (await getPrice(api_response, await getCurrencyID(arr.value[arr.value.length - 1], api_response)) < text) {
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
}

module.exports = onMessage;