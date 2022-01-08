require('dotenv').config();

module.exports = {
    botToken: process.env.BOT_TOKEN,
    mongoApi: process.env.MONGO_API,
    cmcApi: process.env.CMC_API
}