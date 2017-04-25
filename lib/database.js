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

    getAnime(id) {
        return new Promise((resolve, reject) => {
            this.db.findOne({ _id: id }, (err, docs) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(docs)
                }
            })
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

    updateAnimeTitle(anime_id, title) {
        this.db.update({ _id: anime_id }, { $set: { title: title } })
    }

    updateAnimeKeywords(anime_id, keywords) {
        this.db.update({ _id: anime_id }, { $set: { keywords: keywords } })
    }

    updateAnimeEpisode(anime_id, episode) {
        this.db.update({ _id: anime_id }, { $set: { episode: episode } })
    }

    removeAnime(anime_id) {
        this.db.remove({ _id: anime_id })
    }

    fetchAllUserId() {
        return new Promise((resolve, reject) => {
            this.db.find({}, { user_id: 1, _id: 0 }, (err, docs) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(docs)
                }
            })
        })
    }
}

DataBase.AnimesDB = './db/animes.db'
// DataBase.AnimesDB = '../db/animes.db'

module.exports = DataBase