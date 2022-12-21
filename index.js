const dayjs = require('dayjs');
const _ = require('lodash');

// 必要ライブラリの読み込み
const SlackBot = require('slackbots');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();


// SLACK_CHANELは、Slack上に存在するチャンネル(例: general)を指定
const APP_NAME = 'つまらぬ絵文字を作ってしまう五エ門';
const PARAMS = {icon_emoji: ':goemon:'}

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
    if(data.type !== 'desktop_notification') {
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
    if(data.content.includes(' whatsnew')) {
      const now = dayjs().format('YYYY-MM-DD')
      if(now != lastUpdatedAt) {
        await getLatestEmojis(false)
      }
      reportEmojisCreatedYesterday(data)
    } else if(data.content.includes(' all')) {
      reportAllEmoji(data)
    } else {
      getHelp(data)
    }
}

// help情報投稿処理
function getHelp(data) {
    bot.postMessageToChannel(
        getChannelNameToReply(data),
        `【コマンド一覧】\nwhatsnew: 昨日に追加された絵文字を確認します\nall: 追加されたすべての絵文字を確認します\nhelp : ヘルプ情報を表示します`,
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

async function reportEmojisCreatedYesterday(data) {
  let message = ''

  if(addedEmojis.length) {
    message = 'また昨日にこんなつまらぬ絵文字を作ってしまった…\n\n'

    addedEmojis.forEach(emoji => {
      message += `:${emoji}: `
    })
  } else {
    message = '昨日は絵文字を作っていないでござる'
  }
  const channel = getChannelNameToReply(data)
  bot.postMessageToChannel(
    channel,
    message,
    PARAMS
  );
}

async function reportAllEmoji(data) {
  const emojiData = await bot.getEmojis()
  let message = '今までに追加された絵文字は以下でござる\n\n'
  const emojiArray = getEmojiNameArray(emojiData.emoji)
  emojiArray.forEach(emoji => {
    message += `:${emoji}: `
  })
  const channel = getChannelNameToReply(data)
  bot.postMessageToChannel(
    channel,
    message,
    PARAMS
  );
}

function getEmojiNameArray(emojiObject) {
  return Object.keys(emojiObject)
}

// ============
// Channel
// ============

async function getChannelNameFromId(id) {
  const channelData = await bot.getChannels()
  // console.log(channelData)
  return channelData.channels.find(ch => ch.id = id)
}

function getChannelNameToReply(data) {
  return data.subtitle.replace('#', '')
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
