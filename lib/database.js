'use strict'
const Datastore = require('nedb')

// https://github.com/louischatriot/nedb
class DataBase {
    constructor(filename) {
        this.db = new Datastore({ filename: filename, autoload: true })
    }

    addAnime(user_id, title, keywords) {
        this.db.insert({
            user_id: user_id,
            title: title,
            keywords: keywords,
            episode: 0
        })
    }

    getAllAnimes(user_id) {
        return new Promise((resolve, reject) => {
            this.db.find({ user_id: user_id }, (err, docs) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(docs)
                }
            })
        })
    }

    updateAnimeKeywords(anime_id, keywords) {

    }

    updateAnimeEpisode(anime_id, episode) {

    }
}

DataBase.AnimesDB = './db/animes.db'
// DataBase.AnimesDB = '../db/animes.db'

module.exports = DataBase