'use strict';
const DataBase = require('./database');

class EpisodesDB extends DataBase {
    addEpisode(user_id, name, title, torrent, magnet) {
        let self = this;
        return new Promise((resolve) => {
            self.pool.connect().then((client) => {
                client.query('insert into episodes (user_id, name, title, torrent, magnet) values ($1, $2, $3, $4, $5);', [user_id, name, title, torrent, magnet]).then(res => {
                    client.release();
                    console.log('add episode', name, title, torrent, magnet);
                    resolve(true)
                }).catch((err) => {
                    client.release();
                    console.error('[query error]', err.message, err.stack);
                    resolve(false)
                })
            })
        })
    }

    deleteEpisode(id) {
        let self = this;
        return new Promise((resolve) => {
            self.pool.connect().then((client) => {
                client.query('delete from episodes where id = $1;', [id]).then(res => {
                    client.release();
                    console.log('delete episode', id);
                    resolve(true)
                }).catch((err) => {
                    client.release();
                    console.error('[query error]', err.message, err.stack);
                    resolve(false)
                })
            })
        })
    }

    getAllEpisode(user_id) {
        let self = this;
        return new Promise((resolve) => {
            self.pool.connect().then((client) => {
                client.query('select id, name, title, torrent from episodes where user_id = $1 order by title;', [user_id]).then(res => {
                    console.log(`query user ${user_id} ${res.rowCount} episodes`);
                    resolve(res.rowCount > 0 ? res.rows : [])
                }).catch((err) => {
                    console.error('[query error]', err.message, err.stack);
                    resolve([])
                })
            })
        })
    }
}

module.exports = EpisodesDB;