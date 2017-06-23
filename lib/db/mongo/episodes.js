'use strict';
const DataBase = require('./database');
const {ObjectID} = require('mongodb');

class EpisodesDB extends DataBase {
    constructor() {
        super();
        this.episodesdb = this.db.collection('animesub_episodes')
    }

    addEpisode(user_id, name, title, torrent, magnet) {
        return this.episodesdb.insert({user_id, name, title, torrent, magnet})
    }

    deleteEpisode(id) {
        return this.episodesdb.remove({_id: ObjectID(id)}).then((numRemoved) => numRemoved === 1)
    }

    getAllEpisode(user_id) {
        return this.episodesdb.find({user_id}, {fields: {user_id: 0}, sort: [['title', 1]]})
    }
}

module.exports = EpisodesDB;