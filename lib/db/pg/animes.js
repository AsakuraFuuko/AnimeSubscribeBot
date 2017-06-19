'use strict';
const DataBase = require('./database');

class AnimesDB extends DataBase {
    addAnime(user_id, title, keywords) {
        this.pool.connect().then((client) => {
            client.query('insert into animes (user_id, title, keywords, episode) values ($1, $2, $3, $4);', [user_id, title, keywords, -1]).then(res => {
                client.release();
                console.log('add anime', title)
            }).catch((err) => {
                client.release();
                console.error('query error', err.message, err.stack)
            })
        })
    }

    getAnime(id) {
        let self = this;
        return new Promise((resolve) => {
            self.pool.connect().then((client) => {
                client.query('select * from animes where id = $1;', [id]).then(res => {
                    console.log('query anime ', id);
                    resolve(res.rows.length > 0 ? res.rows[0] : null)
                }).catch((err) => {
                    console.error('query error', err.message, err.stack);
                    resolve(null)
                })
            })
        })
    }

    getAllAnimes(user_id) {
        let self = this;
        return new Promise((resolve) => {
            self.pool.connect().then((client) => {
                client.query('select * from animes where user_id = $1;', [user_id]).then(res => {
                    console.log(`query user ${user_id} animes ${res.rows.length}`);
                    resolve(res.rows.length > 0 ? res.rows : null)
                }).catch((err) => {
                    console.error('query error', err.message, err.stack);
                    resolve(null)
                })
            })
        })
    }

    updateAnimeTitle(anime_id, title) {
        this.pool.connect().then((client) => {
            client.query('update animes set title = $1 where id = $2;', [title, anime_id]).then(res => {
                client.release();
                console.log('update anime', anime_id, title)
            }).catch((err) => {
                client.release();
                console.error('query error', err.message, err.stack)
            })
        })
    }

    updateAnimeKeywords(anime_id, keywords) {
        this.pool.connect().then((client) => {
            client.query('update animes set keywords = $1 where id = $2;', [keywords, anime_id]).then(res => {
                client.release();
                console.log('update anime', anime_id, keywords)
            }).catch((err) => {
                client.release();
                console.error('query error', err.message, err.stack)
            })
        })
    }

    updateAnimeEpisode(anime_id, episode) {
        this.pool.connect().then((client) => {
            client.query('update animes set episode = $1 where id = $2;', [episode, anime_id]).then(res => {
                client.release();
                console.log('update anime', anime_id, episode)
            }).catch((err) => {
                client.release();
                console.error('query error', err.message, err.stack)
            })
        })
    }

    removeAnime(anime_id) {
        this.pool.connect().then((client) => {
            client.query('delete from animes where id = $1;', [anime_id]).then(res => {
                client.release();
                console.log('delete anime', anime_id)
            }).catch((err) => {
                client.release();
                console.error('query error', err.message, err.stack)
            })
        })
    }
}

module.exports = AnimesDB;