'use strict';
const DataBase = require('./database');

class AnimesDB extends DataBase {
    constructor() {
        super('./db/animes.db')
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
        this.db.update({_id: anime_id}, {$set: {title: title}})
    }

    updateAnimeKeywords(anime_id, keywords) {
        this.db.update({_id: anime_id}, {$set: {keywords: keywords}})
    }

    updateAnimeEpisode(anime_id, episode) {
        this.db.update({_id: anime_id}, {$set: {episode: episode}})
    }

    removeAnime(anime_id) {
        this.db.remove({_id: anime_id})
    }
}

module.exports = AnimesDB;