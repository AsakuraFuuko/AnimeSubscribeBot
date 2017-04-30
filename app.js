'use strict';
const debug = require('debug')('animesubbot');
const Telegraf = require('telegraf');

const commandArgsMiddleware = require('./lib/commandArgs');
const Config = require('./lib/config');

const AnimesDB = new (require('./lib/db/animes'))();
const UsersDB = new (require('./lib/db/users'))();
const EpisodesDB = new (require('./lib/db/episodes'))();

const Subscribe = require('./animes/subscribe');
const Server = require('./lib/server');

const server = new Server(Config.server.host, Config.server.port, {users: UsersDB, episodes: EpisodesDB});

const tgbot = new Telegraf(Config.tgbot.token, {
    username: Config.tgbot.username
});

tgbot.use(commandArgsMiddleware());

const sub = new Subscribe(tgbot, {animes: AnimesDB, users: UsersDB, episodes: EpisodesDB});

tgbot.catch((err) => {
    console.log('Error', err)
});

process.on('unhandledRejection', (reason) => {
    console.error(reason);
    //   process.exit(1);
});

tgbot.startPolling();
sub.startloop();
server.startListen();
