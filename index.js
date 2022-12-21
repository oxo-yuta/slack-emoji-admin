const dayjs = require('dayjs');
const _ = require('lodash');

// 必要ライブラリの読み込み
const SlackBot = require('slackbots');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();


// SLACK_CHANELは、Slack上に存在するチャンネル(例: general)を指定
const APP_NAME = 'emoji_admin';
const SLACK_CHANEL = 'okuzono-lab-pub';
const PARAMS = {icon_emoji: ':robot_face:'}

// botインスタンスの作成
const bot = new SlackBot({
    token: `${process.env.BOT_TOKEN}`,  // .envファイルのトークンを参照
    name: APP_NAME
});

let latestEmojis = []
let addedEmojis = []
let lastUpdatedAt = dayjs().format('YYYY-MM-DD')

getLatestEmojis(true)

// Slackでのメッセージ投稿の際の処理
bot.on('message', (data) => {
    if(data.type !== 'message') {
        return;
    }
    sendMessage(data);
})

// エラー時の処理
bot.on('error', (err) => {
    console.log('エラー : ' + err);
})

// メッセージごとの投稿処理
async function sendMessage(data) {
    if(data.text.includes(' whatsnew')) {
      const now = dayjs().format('YYYY-MM-DD')
      if(now != lastUpdatedAt) {
        await getLatestEmojis(data)
      }
      reportEmojisCreatedYesterday(data)
    } else if(data.text.includes(' help')) {
        getHelp()
    }
}

// help情報投稿処理
function getHelp() {
    bot.postMessageToChannel(
        SLACK_CHANEL,
        `【コマンド一覧】\nwhatsnew: 昨日に追加された絵文字を確認します\nhelp : ヘルプ情報を表示します`,
        PARAMS
    );
}

// ============
// Emoji
// ============

function getLatestEmojis(isFirst) {
  const emojis = bot.getEmojis()
  emojis.then( data => {
    const emojiArray = getEmojiNameArray(data.emoji)
    addedEmojis = _.differenceWith(emojiArray, latestEmojis)
    latestEmojis = emojiArray
    lastUpdatedAt = dayjs().format('YYYY-MM-DD')
    if(isFirst) {
      addedEmojis = latestEmojis
    }
    console.log('get and saved latest emoji')
    return true
  })
}

function reportEmojisCreatedYesterday(data) {
  let message = '昨日追加された絵文字は以下です！\n\n'

  addedEmojis.forEach(emoji => {
    message += `:${emoji}: `
  })

  console.log(message)

  bot.postMessageToChannel(
    SLACK_CHANEL,
    message,
    PARAMS
  );
}

function getEmojiNameArray(emojiObject) {
  return Object.keys(emojiObject)
}

// =-=-=-=-=-=-=-=-=

const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
