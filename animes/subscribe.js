'use strict'
const debug = require('debug')('subscribe')
const dateFormat = require('dateformat')
const Telegraf = require('telegraf')
const { Router, Extra, memorySession, Markup } = require('telegraf')
require('enum').register()

const Anime = new (require('./anime'))()

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

const Status = new Enum(['None', 'Add', 'Edit', 'EditTitle', 'EditKeyrowds', 'EditEpisode', 'Delete'])

class Subscribe {
    constructor(tgbot, db) {
        this.tgbot = tgbot
        this.db = db
        this.op()
    }

    op() {
        this.tgbot.use(Telegraf.memorySession())
        this.tgbot.on('callback_query', simpleRouter.middleware())

        // other start
        this.tgbot.command('start', (ctx) => {
            console.log('start', ctx.from)
            ctx.reply('管理订阅 /anime \n[/anime 关键字]可以搜索动画')
        })

        this.tgbot.command('debug', (ctx) => {
            ctx.reply(ctx.update.message)
        })
        // other end

        this.tgbot.command('anime', (ctx) => {
            var obj = ctx.state.command
            debug(obj)
            if (obj.args.length > 0) {
                Anime.fetchRSS(obj.args.join(' ')).then((objs) => {
                    debug(objs)
                    var animes = []
                    for (let i = 0; i < Math.min(objs.length, 10); i++) {
                        let anime = objs[i]
                        let str = `${dateFormat(anime.date, 'mm/dd h:MM')} <code>${anime.category}</code> <a href="${anime.torrent}">${anime.title}</a> <a href="${anime.url}">[DMHY]</a>`
                        animes.push(str)
                    }
                    if (animes.length > 0) {
                        return ctx.reply(animes.join('\n'), { parse_mode: 'HTML' })
                    } else {
                        return ctx.reply('没有结果')
                    }
                })
            } else {
                if (ctx.chat.type != 'private') {
                    ctx.reply('请输入关键字，订阅管理私聊可用')
                } else {
                    this.fetchAnimes(ctx)
                }
            }
        })

        simpleRouter.on('anime_add', (ctx) => {
            let user_id = ctx.from.id
            ctx.editMessageText('添加一个动画...')
            ctx.reply('请输入动画的名字(例：从零开始的魔法书)')
            if (!ctx.session.hasOwnProperty('anime')) {
                ctx.session.anime = {}
            }
            ctx.session.anime[user_id] = {
                curr: Status.Add
            }
        })

        simpleRouter.on('anime_edit', (ctx) => {
            let user_id = ctx.from.id
            this.db.getAnime(ctx.state.args[0]).then((anime) => {
                ctx.editMessageText(`<code>动画 「${anime.title}」</code>\n关键字「${anime.keywords}」\n当前集数: ${anime.episode}`, Extra.HTML().markup((m) =>
                    m.inlineKeyboard([
                        m.callbackButton('修改名称', `anime_edit2:title:${anime._id}`),
                        m.callbackButton('修改关键字', `anime_edit2:keywords:${anime._id}`),
                        m.callbackButton('修改当前集数', `anime_edit2:episode:${anime._id}`),
                        m.callbackButton('删除这个订阅', `anime_del:${anime._id}`),
                        m.callbackButton('返回', `anime_edit2:cancle`)
                    ], {
                            wrap: (btn, index, currentRow) => currentRow.length >= (index + 1) / 2
                        })
                ))
                if (!ctx.session.hasOwnProperty('anime')) {
                    ctx.session.anime = {}
                }
                ctx.session.anime[user_id] = {
                    curr: Status.Edit
                }
            })
        })

        simpleRouter.on('anime_edit2', (ctx) => {
            let user_id = ctx.from.id
            switch (ctx.state.args[0]) {
                case 'title':
                    this.db.getAnime(ctx.state.args[1]).then((anime) => {
                        ctx.editMessageText(`<code>修改动画 「${anime.title}」</code>\n请输入新的名称`, { parse_mode: 'HTML' })
                        if (!ctx.session.hasOwnProperty('anime')) {
                            ctx.session.anime = {}
                        }
                        ctx.session.anime[user_id] = {
                            curr: Status.EditTitle,
                            anime_id: ctx.state.args[1]
                        }
                    })
                    break;
                case 'keywords':
                    this.db.getAnime(ctx.state.args[1]).then((anime) => {
                        ctx.editMessageText(`<code>修改动画 「${anime.title}」</code>\n当前关键字「${anime.keywords}」\n请输入新的关键字`, { parse_mode: 'HTML' })
                        if (!ctx.session.hasOwnProperty('anime')) {
                            ctx.session.anime = {}
                        }
                        ctx.session.anime[user_id] = {
                            curr: Status.EditKeyrowds,
                            anime_id: ctx.state.args[1]
                        }

                    })
                    break;
                case 'episode':
                    this.db.getAnime(ctx.state.args[1]).then((anime) => {
                        ctx.editMessageText(`<code>修改动画 「${anime.title}」</code>\n当前集数「${anime.episode}」\n请输入新的集数`, { parse_mode: 'HTML' })
                        if (!ctx.session.hasOwnProperty('anime')) {
                            ctx.session.anime = {}
                        }
                        ctx.session.anime[user_id] = {
                            curr: Status.EditEpisode,
                            anime_id: ctx.state.args[1]
                        }
                    })
                    break;
                default:
                    this.switchNone(ctx)
                    this.fetchAnimes(ctx, true)
                    break;
            }
        })

        simpleRouter.on('anime_del', (ctx) => {
            let user_id = ctx.from.id
            this.db.getAnime(ctx.state.args[0]).then((anime) => {
                ctx.editMessageText(`是否删除订阅动画 「${anime.title}」`, Markup.inlineKeyboard([
                    Markup.callbackButton('确定', `anime_del2:ok:${anime._id}`),
                    Markup.callbackButton('取消', `anime_del2:cancle`)
                ]).extra())
                if (!ctx.session.hasOwnProperty('anime')) {
                    ctx.session.anime = {}
                }
                ctx.session.anime[user_id] = {
                    curr: Status.Delete
                }
            })
        })

        simpleRouter.on('anime_del2', (ctx) => {
            let user_id = ctx.from.id
            if (ctx.state.args[0] === 'ok') {
                this.db.removeAnime(ctx.state.args[1])
            }
            this.switchNone(ctx)
            this.fetchAnimes(ctx, true)
        })

        this.tgbot.on('message', (ctx) => {
            let user_id = ctx.from.id
            if (ctx.session.anime && ctx.session.anime.hasOwnProperty(user_id)) {
                let anime = ctx.session.anime[user_id]
                switch (anime.curr) {
                    case Status.Add:
                        if (!anime.title) {
                            anime.title = ctx.update.message.text
                            ctx.reply('请输入动画的关键字(例：从零开始的魔法书 時雨初空 简 720p)')
                        } else if (!anime.keywords) {
                            anime.keywords = ctx.update.message.text
                            this.db.addAnime(user_id, anime.title, anime.keywords)
                            this.switchNone(ctx)
                            this.fetchAnimes(ctx)
                        }
                        break
                    case Status.EditTitle:
                        if (anime.anime_id) {
                            let title = ctx.update.message.text
                            this.db.updateAnimeTitle(anime.anime_id, title)
                            this.switchNone(ctx)
                            this.fetchAnimes(ctx)
                        }
                        break
                    case Status.EditKeyrowds:
                        if (anime.anime_id) {
                            let keywords = ctx.update.message.text
                            this.db.updateAnimeKeywords(anime.anime_id, keywords)
                            this.switchNone(ctx)
                            this.fetchAnimes(ctx)
                        }
                        break
                    case Status.EditEpisode:
                        if (anime.anime_id) {
                            let episode = parseInt(ctx.update.message.text) || 0
                            this.db.updateAnimeEpisode(anime.anime_id, episode)
                            this.switchNone(ctx)
                            this.fetchAnimes(ctx)
                        }
                        break
                }
            }
        })
    }

    switchNone(ctx) {
        let user_id = ctx.from.id
        if (!ctx.session.hasOwnProperty('anime')) {
            ctx.session.anime = {}
        }
        ctx.session.anime[user_id] = {
            curr: Status.None
        }
    }

    fetchAnimes(ctx, is_cancle = false) {
        let user_id = ctx.from.id
        let user_name = (ctx.from.last_name ? ctx.from.last_name : '') + ctx.from.first_name
        this.db.getAllAnimes(user_id).then((animes) => {
            if (animes.length > 0) {
                let array = []
                for (let anime of animes) {
                    array.push(Markup.callbackButton(anime.title, `anime_edit:${anime._id}`))
                }
                array.push(Markup.callbackButton('添加一个动画', `anime_add:${user_id}`))
                if (is_cancle) {
                    ctx.editMessageText(`「${user_name}」当前订阅的动画 (数量: ${animes.length})`, Markup.inlineKeyboard(array, {
                        wrap: (btn, index, currentRow) => currentRow.length >= 2
                    }).extra())
                }
                else {
                    ctx.reply(`「${user_name}」当前订阅的动画 (数量: ${animes.length})`, Markup.inlineKeyboard(array, {
                        wrap: (btn, index, currentRow) => currentRow.length >= 2
                    }).extra())
                }
            } else {
                if (is_cancle) {
                    ctx.editMessageText(`「${user_name}」没有订阅动画更新`, Markup.inlineKeyboard([
                        Markup.callbackButton('添加一个动画', `anime_add:${user_id}`)
                    ]).extra())
                }
                else {
                    ctx.reply(`「${user_name}」没有订阅动画更新`, Markup.inlineKeyboard([
                        Markup.callbackButton('添加一个动画', `anime_add:${user_id}`)
                    ]).extra())
                }
            }
        })
    }

    getAnimeLoop(promise, fn) {
        var self = this
        return promise.then(fn).then(function (wrapper) {
            return !wrapper.done ? self.getAnimeLoop(Promise.resolve(wrapper), fn) : wrapper;
        });
    }

    getAnime(wrapper) {
        return Anime.fetchRSS(wrapper.keywords + ' ' + ('0' + (wrapper.ep + 1)).slice(-2)).then((objs) => {
            // debug(objs)
            var animes = []
            for (let anime of objs) {
                let str = `${dateFormat(anime.date, 'mm/dd h:MM')} <code>${anime.category}</code> <a href="${anime.torrent}">${anime.title}</a> <a href="${anime.url}">[DMHY]</a>`
                animes.push(str)
            }
            return animes
        }).then((animes) => {
            let results = wrapper.results
            results = results.concat(animes)
            return {
                keywords: wrapper.keywords,
                ep: wrapper.ep + 1,
                results: results,
                anime_id: wrapper.anime_id,
                done: animes.length <= 0
            }
        })
    }

    fetchAnime(user_id) {
        var self = this
        var id = user_id
        return self.db.getAllAnimes(user_id).then((animes) => {
            return Promise.all(animes.map((anime) => {
                return self.getAnimeLoop(Promise.resolve({
                    keywords: anime.keywords,
                    ep: anime.episode,
                    results: [],
                    anime_id: anime._id,
                    done: false
                }), self.getAnime)
            })).then((animes) => {
                return { user_id: id, animes: animes }
            })
        })
    }

    updateLoop() {
        var self = this
        self.db.fetchAllUserId().then((users) => {
            Promise.all(Array.from(new Set(users.map(item => item.user_id))).map((user_id) => {
                return self.fetchAnime(user_id)
            })).then((results) => {
                for (let result of results) {
                    for (let anime of result.animes) {
                        let text = Array.from(new Set(anime.results)).join('\n')
                        if (anime.results.length > 0) {
                            self.tgbot.telegram.sendMessage(result.user_id, text, { parse_mode: 'HTML' }).then(() =>
                                self.db.updateAnimeEpisode(anime.anime_id, anime.ep - 1))
                        }
                    }
                }
            })
        })
    }

    startloop() {
        console.log('[Subscribe] start update loop')
        this.updateLoop()
        setInterval(this.updateLoop, 60 * 60 * 1000) // 1小时
    }
}

module.exports = Subscribe