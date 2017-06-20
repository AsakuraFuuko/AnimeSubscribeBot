'use strict';
const DataBase = require('./database');

class AnimesDB extends DataBase {
    addAnime(user_id, title, keywords) {
        return this.pool.query('insert into animes (user_id, title, keywords, episode) values ($1, $2, $3, $4);', [user_id, title, keywords, -1]).then(res => {
            console.log('add anime', title);
            return true
        }).catch((err) => {
            console.error('[query error]', err.message, err.stack);
            return false
        })
    }

    getAnime(id) {
        return this.pool.query('select *, id as _id from animes where id = $1;', [id]).then(res => {
            let {title} = res.rows[0];
            console.log(`query anime ${id} title is ${title}`);
            return (res.rowCount > 0 ? res.rows[0] : null)
        }).catch((err) => {
            console.error('[query error]', err.message, err.stack);
            return null
        })
    }

    getAllAnimes(user_id) {
        return this.pool.query('select *, id as _id from animes where user_id = $1;', [user_id]).then(res => {
            console.log(`query user ${user_id} ${res.rowCount} animes`);
            return (res.rowCount > 0 ? res.rows : []);
        }).catch((err) => {
            console.error('[query error]', err.message, err.stack);
            return []
        })
    }

    updateAnimeTitle(anime_id, title) {
        return this.pool.query('update animes set title = $1 where id = $2;', [title, anime_id]).then(res => {
            console.log('update anime', anime_id, title);
            return true
        }).catch((err) => {
            console.error('[query error]', err.message, err.stack);
            return false
        })
    }

    updateAnimeKeywords(anime_id, keywords) {
        return this.pool.query('update animes set keywords = $1 where id = $2;', [keywords, anime_id]).then(res => {
            console.log('update anime', anime_id, keywords);
            return true
        }).catch((err) => {
            console.error('[query error]', err.message, err.stack);
            return false
        })
    }

    updateAnimeEpisode(anime_id, episode) {
        return this.pool.query('update animes set episode = $1 where id = $2;', [episode, anime_id]).then(res => {
            console.log('update anime', anime_id, episode);
            return true
        }).catch((err) => {
            console.error('[query error]', err.message, err.stack);
            return false
        })
    }

    removeAnime(anime_id) {
        return this.pool.query('delete from animes where id = $1;', [anime_id]).then(res => {
            console.log('delete anime', anime_id);
            return true
        }).catch((err) => {
            console.error('[query error]', err.message, err.stack);
            return false
        })
    }
}

module.exports = AnimesDB;