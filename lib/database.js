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
        let self = this
        return new Promise((resolve, reject) => {
            self.db.findOne({ _id: id }, (err, docs) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(docs)
                }
            })
        })
    }

    getAllAnimes(user_id) {
        let self = this
        return new Promise((resolve, reject) => {
            self.db.find({ user_id: user_id }, (err, docs) => {
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
        let self = this
        return new Promise((resolve, reject) => {
            self.db.find({}, { user_id: 1, _id: 0 }, (err, docs) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(docs)
                }
            })
        })
    }

    setNotification(user_id, status = true) {
        this.db.findOne({ user_id: user_id }, (err, docs) => {
            if (!docs) {
                this.db.insert({ user_id: user_id, status: status })
            } else {
                this.db.update({ user_id: user_id }, { $set: { status: status } })
            }
        })
    }

    isNotification(user_id) {
        let self = this
        return new Promise((resolve, reject) => {
            self.db.find({ user_id: user_id }, (err, docs) => {
                if (docs.length == 0) {
                    resolve(true)
                } else {
                    resolve(docs[0].status)
                }
            })
        })
    }
}

DataBase.AnimesDB = './db/animes.db'
DataBase.UsersDB = './db/users.db'
// DataBase.AnimesDB = '../db/animes.db'

module.exports = DataBase