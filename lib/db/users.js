'use strict'
const DataBase = require('./database')

class UsersDB extends DataBase {
    constructor() {
        super('./db/users.db')
    }

    fetchAllUserId() {
        let self = this
        return new Promise((resolve, reject) => {
            self.db.find({}, (err, docs) => {
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

module.exports = UsersDB