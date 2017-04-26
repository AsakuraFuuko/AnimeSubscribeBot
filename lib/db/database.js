'use strict'
const Datastore = require('nedb')

// https://github.com/louischatriot/nedb
class DataBase {
    constructor(filename) {
        this.db = new Datastore({ filename: filename, autoload: true })
    }
}

module.exports = DataBase