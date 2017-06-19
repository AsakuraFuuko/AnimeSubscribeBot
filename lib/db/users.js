'use strict';
const DataBase = require('./database');

class UsersDB extends DataBase {
    constructor() {
        super((process.env.DBPATH || '.') + '/db/users.db')
    }

    fetchAllUserId() {
        let self = this;
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
        let self = this;
        return new Promise((resolve, reject) => {
            self.db.findOne({user_id: user_id}, (err, docs) => {
                if (!docs) {
                    self.db.insert({user_id: user_id, status: status}, (err, docs) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(docs)
                        }
                    })
                } else {
                    self.db.update({user_id: user_id}, {$set: {status: status}}, (err, docs) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(docs)
                        }
                    })
                }
            })
        })
    }

    isNotification(user_id) {
        let self = this;
        return new Promise((resolve) => {
            self.db.find({user_id: user_id}, (err, docs) => {
                if (docs.length === 0) {
                    resolve(true)
                } else {
                    resolve(docs[0].status)
                }
            })
        })
    }

    getTokenByUserID(user_id) {
        let self = this;
        return new Promise((resolve) => {
            self.db.find({user_id: user_id}, (err, docs) => {
                if (docs.length > 0) {
                    resolve(docs[0]._id)
                } else {
                    resolve(null)
                }
            })
        })
    }

    getUserIDByToken(token) {
        let self = this;
        return new Promise((resolve) => {
            self.db.find({_id: token}, (err, docs) => {
                if (docs.length > 0) {
                    resolve(docs[0].user_id)
                } else {
                    resolve(null)
                }
            })
        })
    }
}

module.exports = UsersDB;