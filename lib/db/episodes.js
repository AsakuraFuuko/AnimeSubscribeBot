'use strict'
const DataBase = require('./database')

class EpisodesDB extends DataBase {
    constructor() {
        super('./db/episodes.db')
    }

    addEpisode(user_id, name, title, torrent, ep) {
        this.db.insert({ user_id: user_id, name: name, title: title, torrent: torrent })
    }

    deleteEpisode(id) {
        let self = this
        return new Promise((resolve, reject) => {
            this.db.remove({ _id: id }, {}, (err, numRemoved) => {
                if (err) {
                    reject(err)
                }
                if (numRemoved == 1) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            })
        })
    }

    getAllEpisode(user_id) {
        let self = this
        return new Promise((resolve, reject) => {
            self.db.find({ user_id: user_id }).projection({ user_id: 0 }).sort({ title: 1 }).exec((err, docs) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(docs)
                }
            })
        })
    }
}

module.exports = EpisodesDB