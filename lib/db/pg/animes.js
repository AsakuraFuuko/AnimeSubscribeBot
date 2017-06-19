'use strict';
const DataBase = require('./database');

class AnimesDB extends DataBase {
    addAnime(user_id, title, keywords) {
        let self = this;
        return new Promise((resolve) => {
            self.pool.connect().then((client) => {
                client.query('insert into animes (user_id, title, keywords, episode) values ($1, $2, $3, $4);', [user_id, title, keywords, -1]).then(res => {
                    client.release();
                    console.log('add anime', title);
                    resolve(true)
                }).catch((err) => {
                    client.release();
                    console.error('query error', err.message, err.stack)
                    resolve(false)
                })
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
                    resolve(res.rows.length > 0 ? res.rows : [])
                }).catch((err) => {
                    console.error('query error', err.message, err.stack);
                    resolve([])
                })
            })
        })
    }

    updateAnimeTitle(anime_id, title) {
        let self = this;
        return new Promise((resolve) => {
            self.pool.connect().then((client) => {
                client.query('update animes set title = $1 where id = $2;', [title, anime_id]).then(res => {
                    client.release();
                    console.log('update anime', anime_id, title);
                    console.log(res.rows[0]);
                    resolve(true)
                }).catch((err) => {
                    client.release();
                    console.error('query error', err.message, err.stack);
                    resolve(false)
                })
            })
        })
    }

    updateAnimeKeywords(anime_id, keywords) {
        let self = this;
        return new Promise((resolve) => {
            self.pool.connect().then((client) => {
                client.query('update animes set keywords = $1 where id = $2;', [keywords, anime_id]).then(res => {
                    client.release();
                    console.log('update anime', anime_id, keywords);
                    resolve(true)
                }).catch((err) => {
                    client.release();
                    console.error('query error', err.message, err.stack);
                    resolve(false)
                })
            })
        })
    }

    updateAnimeEpisode(anime_id, episode) {
        let self = this;
        return new Promise((resolve) => {
            self.pool.connect().then((client) => {
                client.query('update animes set episode = $1 where id = $2;', [episode, anime_id]).then(res => {
                    client.release();
                    console.log('update anime', anime_id, episode);
                    resolve(true)
                }).catch((err) => {
                    client.release();
                    console.error('query error', err.message, err.stack);
                    resolve(false)
                })
            })
        })
    }

    removeAnime(anime_id) {
        let self = this;
        return new Promise((resolve) => {
            self.pool.connect().then((client) => {
                client.query('delete from animes where id = $1;', [anime_id]).then(res => {
                    client.release();
                    console.log('delete anime', anime_id);
                    resolve(true)
                }).catch((err) => {
                    client.release();
                    console.error('query error', err.message, err.stack);
                    resolve(false)
                })
            })
        })
    }
}

module.exports = AnimesDB;