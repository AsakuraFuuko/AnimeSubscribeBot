'use strict';
const DataBase = require('./database');
const {ObjectID} = require('mongodb');

class AnimesDB extends DataBase {
    constructor() {
        super();
        this.animedb = this.db.collection('animesub_animes')
    }

    addAnime(user_id, title, keywords) {
        return this.animedb.insert({user_id, title, keywords, episode: -1})
    }

    getAnime(id) {
        return this.animedb.findOne({_id: ObjectID(id)})
    }

    getAllAnimes(user_id) {
        return this.animedb.find({user_id}, {sort: [['title', 1]]})
    }

    updateAnimeTitle(anime_id, title) {
        return this.animedb.update({_id: ObjectID(anime_id)}, {title})
    }

    updateAnimeKeywords(anime_id, keywords) {
        return this.animedb.update({_id: ObjectID(anime_id)}, {keywords})
    }

    updateAnimeEpisode(anime_id, episode) {
        return this.animedb.update({_id: ObjectID(anime_id)}, {episode})
    }

    removeAnime(anime_id) {
        return this.animedb.remove({_id: ObjectID(anime_id)})
    }
}

module.exports = AnimesDB;