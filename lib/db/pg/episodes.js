'use strict';
const DataBase = require('./database');

class EpisodesDB extends DataBase {
    addEpisode(user_id, name, title, torrent, magnet) {
        return this.pool.query('insert into episodes (user_id, name, title, torrent, magnet) values ($1, $2, $3, $4, $5);', [user_id, name, title, torrent, magnet]).then(res => {
            console.log('add episode', name, title, torrent, magnet);
            return true
        }).catch((err) => {
            console.error('[query error]', err.message, err.stack);
            return false
        })
    }

    deleteEpisode(id) {
        return this.pool.query('delete from episodes where id = $1;', [id]).then(res => {
            console.log('delete episode', id);
            return true
        }).catch((err) => {
            console.error('[query error]', err.message, err.stack);
            return false
        })
    }

    getAllEpisode(user_id) {
        return this.pool.query('select id, name, title, torrent from episodes where user_id = $1 order by title;', [user_id]).then(res => {
            console.log(`query user ${user_id} ${res.rowCount} episodes`);
            return (res.rowCount > 0 ? res.rows : [])
        }).catch((err) => {
            console.error('[query error]', err.message, err.stack);
            return []
        })
    }
}

module.exports = EpisodesDB;