'use strict';
const debug = require('debug')('subscribe');
const dateFormat = require('dateformat');
const Utils = require('../lib/utils');
const log = require('../lib/logger');

const Anime = new (require('./anime'))();

class Subscribe {
    constructor(tgbot, db, botname) {
        this.tgbot = tgbot;
        this.db = db;
        this.botname = botname;
        this.op()
    }

    op() {
        let self = this;

        // other start
        this.tgbot.onText(/\/start(@\w+)?(?: )?(.*)/, (msg, match) => {
            let user_id = msg.from.id;
            let chat_id = msg.chat.id;
            let bot_name = match[1];
            if (bot_name && bot_name !== this.botname) {
                return;
            }
            let args = match[2];
            debug(args);

            log('start', msg.from);
            this.db.users.setNotification(parseInt(user_id), true);
            return this.tgbot.sendMessage(chat_id, '管理订阅 /anime \n[/anime 关键字]可以搜索动画')
        });

        this.tgbot.onText(/\/debug(@\w+)?(?: )?(.*)/, (msg, match) => {
            let chat_id = msg.chat.id;
            let bot_name = match[1];
            if (bot_name && bot_name !== this.botname) {
                return;
            }
            let args = match[2];
            debug(args);

            return this.tgbot.sendMessage(chat_id, msg.update.message)
        });

        this.tgbot.onText(/\/token(@\w+)?(?: )?(.*)/, (msg, match) => {
            let user_id = msg.from.id;
            let chat_id = msg.chat.id;
            let bot_name = match[1];
            if (bot_name && bot_name !== this.botname) {
                return;
            }
            let args = match[2];
            debug(args);

            if (msg.chat.type !== 'private') {
                return this.tgbot.sendMessage(chat_id, '私聊可用')
            } else {
                return this.db.users.getTokenByUserID(user_id).then((token) => {
                    return this.tgbot.sendMessage(chat_id, `你的token是: ${token}`)
                })
            }
        });
        // other end

        this.tgbot.onText(/\/anime(@\w+)?(?: )?(.*)/, (msg, match) => {
            let chat_id = msg.chat.id;
            let bot_name = match[1];
            if (bot_name && bot_name !== this.botname) {
                return;
            }
            let args = match[2];
            debug(args);

            if (args.length > 0) {
                return Anime.fetchRSS(args.join(' ')).then((objs) => {
                    debug(objs);
                    let animes = [];
                    for (let i = 0; i < Math.min(objs.length, 10); i++) {
                        let anime = objs[i];
                        let str = `${dateFormat(anime.date, 'mm/dd HH:MM')} <code>${anime.category}</code> <a href="${anime.torrent}">${anime.title}</a> <a href="${anime.url}">[DMHY]</a>`;
                        animes.push(str)
                    }
                    if (animes.length > 0) {
                        return this.tgbot.sendMessage(chat_id, animes.join('\n'), {parse_mode: 'HTML'})
                    } else {
                        return this.tgbot.sendMessage(chat_id, '没有结果')
                    }
                })
            } else {
                if (msg.chat.type !== 'private') {
                    return this.tgbot.sendMessage(chat_id, '请输入关键字，订阅管理私聊可用')
                } else {
                    fetchAnimes({
                        user_id: msg.from.id,
                        chat_id,
                        msg_id: msg.message_id,
                        user_name: (msg.from.last_name ? msg.from.last_name : '') + msg.from.first_name
                    })
                }
            }
        });

        this.tgbot.on('callback_query', (callbackQuery) => {
            const action = callbackQuery.data;
            const msg = callbackQuery.message;
            const opts = {
                user_id: callbackQuery.from.id,
                chat_id: msg.chat.id,
                msg_id: msg.message_id,
                callback_id: callbackQuery.id,
                user_name: (callbackQuery.from.last_name ? callbackQuery.from.last_name : '') + callbackQuery.from.first_name
            };

            return handleCallbackQuery(action, opts, msg)
        });

        function handleCallbackQuery(action, opts, msg) {
            debug(action);
            debug(msg);
            debug(opts);

            let args = action.split('‼');
            switch (args[0]) {
                case 'add' : {
                    return animeAddHandle(opts)
                }
                case 'menu': {
                    let anime_id = args[2];
                    switch (args[1]) {
                        case 'edit': {
                            return animeEditMenuHandle(Object.assign(opts, {anime_id}))
                        }
                        case 'delete': {
                            return animeDeleteMenuHandle(Object.assign(opts, {anime_id}))
                        }
                    }
                    break;
                }
                case 'edit': {
                    let action = args[1];
                    let anime_id = args[2];
                    return animeEditHandle(Object.assign(opts, {anime_id, action}))
                }
                case 'delete': {
                    let action = args[1];
                    let anime_id = args[2];
                    return animeDeleteHandle(Object.assign(opts, {anime_id, action}))
                }
                case 'notify': {
                    let action = args[1];
                    let anime_id = args[2];
                    return animeNotifyHandle(Object.assign(opts, {anime_id, action}))
                }
            }
        }

        function animeAddHandle(opts) {
            let {chat_id, user_id, msg_id} = opts;
            let anime = {};
            return self.tgbot.deleteMessage(chat_id, msg_id).then(() => {
                return self.tgbot.sendMessage(chat_id, '请输入动画的名字(例：从零开始的魔法书)', {
                    reply_markup: {
                        force_reply: true
                    }
                }).then((sended) => {
                    return self.tgbot.onReplyToMessage(chat_id, sended.message_id, (replyMessage) => {
                        if (replyMessage && replyMessage.text.trim()) {
                            anime.title = replyMessage.text.trim();
                            return self.tgbot.sendMessage(chat_id, '请输入动画的关键字(例：从零开始的魔法书 時雨初空 简 720 mp4)', {
                                reply_markup: {
                                    force_reply: true
                                }
                            }).then((sended) => {
                                return self.tgbot.onReplyToMessage(chat_id, sended.message_id, (replyMessage) => {
                                    if (replyMessage && replyMessage.text.trim()) {
                                        anime.keywords = replyMessage.text.trim();
                                        self.db.animes.addAnime(user_id, anime.title, anime.keywords);
                                        fetchAnimes(opts);
                                    }
                                });
                            })
                        }
                    });
                })
            })
        }

        function animeEditMenuHandle(opts) {
            let {chat_id, msg_id, anime_id} = opts;
            return self.db.animes.getAnime(anime_id).then((anime) => {
                return self.tgbot.editMessageText(`<code>动画 「${anime.title}」</code>\n关键字「${anime.keywords}」\n当前集数: ${anime.episode}`, {
                    chat_id: chat_id,
                    message_id: msg_id,
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [[
                            {text: '修改名称', callback_data: `edit‼title‼${anime._id}`},
                            {text: '修改关键字', callback_data: `edit‼keywords‼${anime._id}`}
                        ], [
                            {text: '修改当前集数', callback_data: `edit‼episode‼${anime._id}`},
                            {text: '删除这个订阅', callback_data: `menu‼delete‼${anime._id}`}
                        ], [
                            {text: '返回', callback_data: `edit‼cancel`},
                        ]]
                    }
                })
            })
        }

        function animeEditHandle(opts) {
            let {chat_id, msg_id, anime_id, action} = opts;
            switch (action) {
                case 'title':
                    return self.db.animes.getAnime(anime_id).then((anime) => {
                        return self.tgbot.sendMessage(chat_id, `<code>修改动画 「${anime.title}」</code>\n请输入新的名称`, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                force_reply: true
                            }
                        }).then((sended) => {
                            return self.tgbot.onReplyToMessage(chat_id, sended.message_id, (replyMessage) => {
                                if (replyMessage && replyMessage.text.trim()) {
                                    return self.tgbot.deleteMessage(chat_id, msg_id).then(() => {
                                        self.db.animes.updateAnimeTitle(anime_id, replyMessage.text.trim());
                                        fetchAnimes(opts)
                                    })
                                }
                            });
                        })
                    });
                    break;
                case 'keywords':
                    return self.db.animes.getAnime(anime_id).then((anime) => {
                        return self.tgbot.sendMessage(chat_id, `<code>修改动画 「${anime.title}」</code>\n当前关键字「${anime.keywords}」\n请输入新的关键字`, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                force_reply: true
                            }
                        }).then((sended) => {
                            return self.tgbot.onReplyToMessage(chat_id, sended.message_id, (replyMessage) => {
                                if (replyMessage && replyMessage.text.trim()) {
                                    return self.tgbot.deleteMessage(chat_id, msg_id).then(() => {
                                        self.db.animes.updateAnimeKeywords(anime_id, replyMessage.text.trim());
                                        fetchAnimes(opts)
                                    })
                                }
                            });
                        })
                    });
                    break;
                case 'episode':
                    return self.db.animes.getAnime(anime_id).then((anime) => {
                        return self.tgbot.sendMessage(chat_id, `<code>修改动画 「${anime.title}」</code>\n当前集数「${anime.episode}」\n请输入新的集数`, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                force_reply: true
                            }
                        }).then((sended) => {
                            return self.tgbot.onReplyToMessage(chat_id, sended.message_id, (replyMessage) => {
                                if (replyMessage && replyMessage.text.trim()) {
                                    return self.tgbot.deleteMessage(chat_id, msg_id).then(() => {
                                        self.db.animes.updateAnimeEpisode(anime_id, replyMessage.text.trim());
                                        fetchAnimes(opts)
                                    })
                                }
                            });
                        })
                    });
                    break;
                case 'cancel':
                default: {
                    fetchAnimes(opts, true);
                    break;
                }
            }
        }

        function animeDeleteMenuHandle(opts) {
            let {chat_id, msg_id, anime_id} = opts;
            return self.db.animes.getAnime(anime_id).then((anime) => {
                return self.tgbot.editMessageText(`是否删除订阅动画 「${anime.title}」`, {
                    chat_id: chat_id,
                    message_id: msg_id,
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [[
                            {text: '确定', callback_data: `delete‼ok‼${anime._id}`},
                            {text: '取消', callback_data: `delete‼cancel‼${anime._id}`}
                        ]]
                    }
                })
            })
        }

        function animeDeleteHandle(opts) {
            let {anime_id, action} = opts;
            switch (action) {
                case 'ok':
                    self.db.animes.removeAnime(anime_id);
                    fetchAnimes(opts, true);
                    break;
                case 'cancel':
                default: {
                    animeEditMenuHandle(opts);
                    break;
                }
            }
        }

        function animeNotifyHandle(opts) {
            let {action, user_id} = opts;
            if (action === 'on') {
                self.db.users.setNotification(parseInt(user_id), true)
            } else if (action === 'off') {
                self.db.users.setNotification(parseInt(user_id), false)
            }
            fetchAnimes(opts, true)
        }

        function fetchAnimes(opts, is_cancel = false) {
            let {user_name, user_id, chat_id, msg_id} = opts;
            self.db.animes.getAllAnimes(user_id).then((animes) => {
                debug(animes);
                if (animes.length > 0) {
                    self.db.users.isNotification(user_id).then((status) => {
                        let array = [];
                        if (status) {
                            array.push({text: '订阅推送: 开', callback_data: `notify‼off‼${user_id}`})
                        } else {
                            array.push({text: '订阅推送: 关', callback_data: `notify‼on‼${user_id}`})
                        }
                        array.push({text: '添加一个动画', callback_data: `add‼${user_id}`});
                        for (let anime of animes) {
                            array.push({
                                text: `${anime.title} (${anime.episode})`,
                                callback_data: `menu‼edit‼${anime._id}`
                            })
                        }
                        return array
                    }).then((array) => {
                        if (is_cancel) {
                            return self.tgbot.editMessageText(`「${user_name}」当前订阅的动画 (数量: ${animes.length})`, {
                                    chat_id: chat_id,
                                    message_id: msg_id,
                                    reply_markup: {
                                        inline_keyboard: Utils.ArrayToArrays(array, 2)
                                    }
                                }
                            )
                        }
                        else {
                            return self.tgbot.sendMessage(chat_id, `「${user_name}」当前订阅的动画 (数量: ${animes.length})`, {
                                reply_markup: {
                                    inline_keyboard: Utils.ArrayToArrays(array, 2)
                                }
                            })
                        }
                    })
                } else {
                    if (is_cancel) {
                        return self.tgbot.editMessageText(`「${user_name}」没有订阅动画更新`, {
                                chat_id: chat_id,
                                message_id: msg_id,
                                reply_markup: {
                                    inline_keyboard: [[{text: '添加一个动画', callback_data: `add‼${user_id}`}]]
                                }
                            }
                        )
                    }
                    else {
                        return self.tgbot.sendMessage(chat_id, `「${user_name}」没有订阅动画更新`, {
                                reply_markup: {
                                    inline_keyboard: [[{text: '添加一个动画', callback_data: `add‼${user_id}`}]]
                                }
                            }
                        )
                    }
                }
            })
        }
    }

    // fetch anime start
    getAnimeLoop(promise, fn) {
        let self = this;
        return promise.then(fn).then(function (wrapper) {
            return !wrapper.done ? self.getAnimeLoop(Promise.resolve(wrapper), fn) : wrapper;
        });
    }

    getAnime(wrapper) {
        log(`[Subscribe] fetch anime ${wrapper.title} [${wrapper.ep}]`);
        return Anime.fetchRSS(wrapper.keywords + ' ' + ('0' + (wrapper.ep)).slice(-2)).then((objs) => {
            // debug(objs)
            let animes = [];
            for (let anime of objs) {
                let eps = Utils.ParseEpisode(anime.title);
                if (eps.ep.indexOf(wrapper.ep) > -1) {
                    let str = `${dateFormat(anime.date, 'mm/dd HH:MM')} <code>${anime.category}</code> <a href="${anime.torrent}">${anime.title}</a> <a href="${anime.url}">[DMHY]</a>`;
                    animes.push({text: str, data: anime})
                }
            }
            return animes
        }).then((animes) => {
            let results = wrapper.results;
            results = results.concat(animes);
            wrapper.results = results;
            wrapper.done = (wrapper.ep === 0) ? false : animes.length <= 0;
            wrapper.ep += 1;
            return wrapper
        })
    }

    fetchAnime(user) {
        let self = this;
        let {user_id} = user;
        log(`[Subscribe] fetch user(${user_id}) animes`);
        return self.db.animes.getAllAnimes(user_id).then((animes) => {
            return Promise.all(animes.map((anime) => {
                return self.getAnimeLoop(Promise.resolve({
                    keywords: anime.keywords,
                    ep: parseInt(anime.episode) + 1,
                    title: anime.title,
                    results: [],
                    anime_id: anime._id,
                    done: false
                }), self.getAnime)
            })).then((animes) => {
                return {user: user, animes: animes}
            })
        })
    }

    updateLoop(self) {
        self.db.users.fetchAllUserId().then((users) => {
            return Promise.all(users.map((user) => {
                return self.fetchAnime(user)
            }))
        }).then((results) => {
            for (let result of results) {
                let {user_id, status} = result.user;
                for (let anime of result.animes) {
                    let text = Array.from(new Set(anime.results.map((result) => result.text))).join('\n');
                    if (anime.results.length > 0) {
                        for (let obj of Utils.UniqueBy(anime.results.map((result) => result.data), (item) => item.title)) {
                            this.db.episodes.addEpisode(user_id, anime.title, obj.title, obj.torrent, obj.magnet)
                        }
                        if (status) {
                            self.tgbot.sendMessage(user_id, text, {
                                parse_mode: 'HTML',
                                disable_web_page_preview: true
                            }).then(() =>
                                self.db.animes.updateAnimeEpisode(anime.anime_id, anime.ep - 2))
                        } else {
                            self.db.animes.updateAnimeEpisode(anime.anime_id, anime.ep - 2)
                        }
                    }
                }
            }
        })
    }

    startloop() {
        log('[Subscribe] start update loop');
        this.updateLoop(this);
        setInterval(() => {
            this.updateLoop(this)
        }, 60 * 60 * 1000) // 1小时
    }

    // fetch anime end
}

module.exports = Subscribe;