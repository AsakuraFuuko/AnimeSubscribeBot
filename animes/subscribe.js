'use strict'
const debug = require('debug')('subscribe')
const Telegraf = require('telegraf')
const { Router, Extra, memorySession, Markup } = require('telegraf')

const simpleRouter = new Router((ctx) => {
    if (!ctx.callbackQuery.data) {
        return Promise.resolve()
    }
    const parts = ctx.callbackQuery.data.split(':')
    return Promise.resolve({
        route: parts[0],
        state: {
            args: parts.slice(1, parts.length)
        }
    })
})

class Subscribe {
    constructor(tgbot, db) {
        this.tgbot = tgbot
        this.db = db
        this.op()
    }

    op() {
        this.tgbot.use(Telegraf.memorySession())
        this.tgbot.on('callback_query', simpleRouter.middleware())

        this.tgbot.command('anime', (ctx) => {
            var obj = ctx.state.command
            debug(obj)
            if (obj.args.length > 0) {
                Anime.fetchRSS(obj.args.join(' ')).then((objs) => {
                    debug(objs)
                    var animes = []
                    for (let anime of objs) {
                        let str = `${dateFormat(anime.date, 'mm/dd h:MM')} <code>${anime.category}</code> <a href="${anime.torrent}">${anime.title}</a> <a href="${anime.url}">[DMHY]</a>`
                        animes.push(str)
                    }
                    return ctx.reply(animes.join('\n'), { parse_mode: 'HTML' })
                })
            } else {
                let user_id = ctx.from.id
                let user_name = (ctx.from.last_name ? ctx.from.last_name : '') + ctx.from.first_name
                if (this.db.getAllAnimes(user_id).length > 0) {

                } else {
                    return ctx.reply(`${user_name} 没有订阅动画更新`, Markup.inlineKeyboard([
                        Markup.callbackButton('添加一个动画', `anime_add:${user_id}`)
                    ]).extra())
                }
            }
        })

        simpleRouter.on('anime_add', (ctx) => {
            let user_id = ctx.from.id
            ctx.editMessageText('处理中...')
            ctx.reply('请输入动画的名字(例：从零开始的魔法书)', Markup.forceReply().extra())
            if (!ctx.session.hasOwnProperty('anime')) {
                ctx.session.anime = {}
            }
            ctx.session.anime[user_id] = {}
        })

        this.tgbot.on('message', (ctx) => {
            let user_id = ctx.from.id
            if (ctx.session.anime.hasOwnProperty(user_id)) {
                let anime = ctx.session.anime[user_id]
                if (!anime.title) {
                    anime.title = ctx.update.message.text
                    ctx.reply('请输入动画的关键字(例：从零开始的魔法书 時雨初空 简)', Markup.forceReply().extra())
                } else if (!anime.keywords) {

                }
            }
        })
    }

    updateLoop() {

    }

    startloop() {
        console.log('[Subscribe] start update loop')
        setInterval(this.updateLoop, 60 * 60 * 1000) // 1小时
    }
}

module.exports = Subscribe