'use strict'
const debug = require('debug')('animesubbot')
const Telegraf = require('telegraf')
const dateFormat = require('dateformat')

const commandArgsMiddleware = require('./lib/commandArgs')
const Utils = require('./lib/utils')
const Config = require('./lib/config')

const Anime = new (require('./animes/Anime'))()

const database = require('./lib/database')
const AnimeDB = new database(database.AnimesDB)

const Subscribe = require('./animes/subscribe')

const tgbot = new Telegraf(Config.tgbot.token, {
    username: Config.tgbot.username
})

tgbot.use(commandArgsMiddleware())

const sub = new Subscribe(tgbot, AnimeDB)

// other start
tgbot.command('start', (ctx) => {
    console.log('start', ctx.from)
    ctx.reply('喵~')
})

tgbot.command('debug', (ctx) => {
    ctx.reply(ctx.update.message)
})
// other end

tgbot.catch((err) => {
    console.log('Error', err)
})

process.on('unhandledRejection', (reason) => {
    console.error(reason);
    //   process.exit(1);
});

tgbot.startPolling()
sub.startloop()
