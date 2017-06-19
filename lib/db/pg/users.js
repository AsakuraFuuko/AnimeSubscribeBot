'use strict';
const generateId = require('time-uuid');
const DataBase = require('./database');

class UsersDB extends DataBase {
    fetchAllUserId() {
        let self = this;
        return new Promise((resolve) => {
            self.pool.connect().then((client) => {
                client.query('select * from users;').then(res => {
                    console.log(`query all user ${res.rows.length}`);
                    resolve(res.rows.length > 0 ? res.rows : [])
                }).catch((err) => {
                    console.error('query error', err.message, err.stack);
                    resolve([])
                })
            })
        })
    }

    setNotification(user_id, status = true) {
        this.pool.connect().then((client) => {
            client.query('insert into users (user_id, status, token) values ($1, $2, $3) on conflict (user_id) do update set status = $2;', [user_id, status, generateId()]).then(res => {
                client.release();
                console.log('set notify', user_id)
            }).catch((err) => {
                client.release();
                console.error('query error', err.message, err.stack)
            })
        })
    }

    isNotification(user_id) {
        let self = this;
        return new Promise((resolve) => {
            self.pool.connect().then((client) => {
                client.query('select status from users where user_id = $1;', [user_id]).then(res => {
                    console.log(`query user ${res.rows.length}`);
                    resolve(res.rows.length > 0 ? res.rows[0].status : true)
                }).catch((err) => {
                    console.error('query error', err.message, err.stack);
                    resolve(true)
                })
            })
        })
    }

    getTokenByUserID(user_id) {
        let self = this;
        return new Promise((resolve) => {
            self.pool.connect().then((client) => {
                client.query('select token from users where user_id = $1;', [user_id]).then(res => {
                    console.log(`query user ${res.rows.length}`);
                    resolve(res.rows.length > 0 ? res.rows[0].token : null)
                }).catch((err) => {
                    console.error('query error', err.message, err.stack);
                    resolve(null)
                })
            })
        })
    }
}

module.exports = UsersDB;