'use strict';
const DataBase = require('./database');

class AnimesDB extends DataBase {
    constructor() {
        super((process.env.DBPATH || '.') + '/db/animes.db')
    }

    addAnime(user_id, title, keywords) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.db.insert({
                user_id: user_id,
                title: title,
                keywords: keywords,
                episode: -1
            }, (err, docs) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(docs)
                }
            })
        })
    }

    getAnime(id) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.db.findOne({_id: id}, (err, docs) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(docs)
                }
            })
        })
    }

    getAllAnimes(user_id) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.db.find({user_id: user_id}).sort({title: 1}).exec((err, docs) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(docs)
                }
            })
        })
    }

    updateAnimeTitle(anime_id, title) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.db.update({_id: anime_id}, {$set: {title: title}}, (err, docs) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(docs)
                }
            })
        })
    }

    updateAnimeKeywords(anime_id, keywords) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.db.update({_id: anime_id}, {$set: {keywords: keywords}}, (err, docs) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(docs)
                }
            })
        })
    }

    updateAnimeEpisode(anime_id, episode) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.db.update({_id: anime_id}, {$set: {episode: episode}}, (err, docs) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(docs)
                }
            })
        })
    }

    removeAnime(anime_id) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.db.remove({_id: anime_id}, (err, docs) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(docs)
                }
            })
        })
    }
}

module.exports = AnimesDB;