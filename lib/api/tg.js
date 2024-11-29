'use strict'

const TelegramBot = require('node-telegram-bot-api');
const config = require('../../config/config')

/**
 * 發送tg需訊息
 *
 * @param String msg 訊息內容
 *
 * @returns {Object}
 */
async function sendMessage (msg) {
  const token = config.tg_token;
  const chatId = config.tg_chat_id
  const bot = new TelegramBot(token, {polling: true});

  bot.sendMessage(chatId, msg);

  return
}

module.exports = {
  sendMessage
}
