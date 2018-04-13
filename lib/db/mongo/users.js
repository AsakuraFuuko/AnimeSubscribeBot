'use strict';
const DataBase = require('./database');
const {ObjectID} = require('mongodb');

class UsersDB extends DataBase {
    constructor() {
        super();
        this.userdb = this.db.collection('animesub_users')
    }

    fetchAllUserId() {
        return this.userdb.find({})
    }

    setNotification(user_id, first_name, last_name, username, status = null) {
        if (!!status) {
            return this.userdb.findAndModifyOrUpsert({user_id}, [['user_id', 1]], {
                status,
                first_name,
                last_name,
                username
            })
        } else {
            return this.userdb.findAndModifyOrUpsert({user_id}, [['user_id', 1]], {
                first_name,
                last_name,
                username
            })
        }
    }

    isNotification(user_id) {
        return this.userdb.findOne({user_id}).then((doc) => doc ? doc.status : true)
    }

    getTokenByUserID(user_id) {
        return this.userdb.findOne({user_id}).then((doc) => doc ? doc._id : null)
    }

    getUserIDByToken(token) {
        return this.userdb.findOne({_id: ObjectID(token)}).then((doc) => doc ? doc.user_id : null)
    }
}

module.exports = UsersDB;
