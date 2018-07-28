'use strict';
const debug = require('debug')('animesubbot');
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');

const log = require('./lib/logger');

const Subscribe = require('./animes/subscribe');

let UsersDB, AnimesDB, EpisodesDB, SettingsDB;
let isLocal = process.env.LOCAL === 'true';
console.log('isLocal =', isLocal);

// AnimesDB = new (require('./lib/db/pg/animes'))();
// UsersDB = new (require('./lib/db/pg/users'))();
// EpisodesDB = new (require('./lib/db/pg/episodes'))();
AnimesDB = new (require('./lib/db/mongo/animes'))();
UsersDB = new (require('./lib/db/mongo/users'))();
EpisodesDB = new (require('./lib/db/mongo/episodes'))();
SettingsDB = new (require('./lib/db/mongo/settings'))();

const TOKEN = process.env.TELEGRAM_TOKEN;
const PORT = process.env.PORT || 5000;

let botname = '@bot_name';
const url = process.env.APP_URL;
const tgbot = new TelegramBot(TOKEN);
let sub;

// if (isLocal) {
//     tgbot.setWebHook(`${url}/bot${TOKEN}`, {
//         certificate: `${__dirname}/cert.pem`,
//     });
// } else {
tgbot.setWebHook(`${url}/bot${TOKEN}`);
// }

tgbot.getMe().then((msg) => {
    tgbot.getWebHookInfo().then((res) => {
        debug(JSON.stringify(res))
    });

    botname = '@' + msg.username;
    sub = new Subscribe(tgbot, {animes: AnimesDB, users: UsersDB, episodes: EpisodesDB, settings: SettingsDB}, botname);
    sub.startloop();
});

const app = express();

app.use(bodyParser.json());

app.post(`/bot${TOKEN}`, (req, res) => {
    tgbot.processUpdate(req.body);
    res.sendStatus(200);
});

app.get('/episodes/:token', (req, res) => {
    return UsersDB.getUserIDByToken(req.params.token).then((user_id) => {
        return EpisodesDB.getAllEpisode(user_id).then((episodes) => {
            debug(episodes);
            res.json({status: true, result: episodes})
        })
    }).catch((err) => {
        console.error(err);
        res.json({status: false, result: err.message})
    })
});

app.delete('/episode/:id', (req, res) => {
    EpisodesDB.deleteEpisode(req.params.id).then((result) => {
        res.json({status: result})
    })
});

app.get('/lastupdate', (req, res) => {
    res.json({status: true, result: sub.lastupdate})
});

if (isLocal) {
    https.createServer({
        key: fs.readFileSync(`${__dirname}/private.key`),
        cert: fs.readFileSync(`${__dirname}/cert.pem`)
    }, app).listen(PORT, '0.0.0.0', null, function () {
        console.log(`Server listening on port ${this.address().port} in ${app.settings.env} mode`);
    });
} else {
    app.listen(PORT, () => {
        console.log(`Express server is listening on ${PORT}`);
    });
}

process.on('unhandledRejection', (reason) => {
    console.error(reason);
    //   process.exit(1);
});

require('heroku-self-ping')(url, {interval: 25 * 60 * 1000});
