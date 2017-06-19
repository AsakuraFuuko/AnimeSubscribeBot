'use strict';
const generateId = require('time-uuid');
const DataBase = require('./database');

class UsersDB extends DataBase {
    fetchAllUserId() {
        let self = this;
        return new Promise((resolve) => {
            self.pool.connect().then((client) => {
                client.query('select * from users;').then(res => {
                    client.release();
                    console.log(`query ${res.rowCount} users`);
                    resolve(res.rowCount > 0 ? res.rows : [])
                }).catch((err) => {
                    client.release();
                    console.error('[query error]', err.message, err.stack);
                    resolve([])
                })
            })
        })
    }

    setNotification(user_id, status = true) {
        let self = this;
        return new Promise((resolve) => {
            self.pool.connect().then((client) => {
                client.query('insert into users (user_id, status, token) values ($1, $2, $3) on conflict (user_id) do update set status = $2 returning token;', [user_id, status, generateId()]).then(res => {
                    client.release();
                    console.log(`set user ${user_id} notify is ${status} with token ${res.rows[0].token}`);
                    resolve(true)
                }).catch((err) => {
                    client.release();
                    console.error('[query error]', err.message, err.stack);
                    resolve(false)
                })
            })
        })
    }

    isNotification(user_id) {
        let self = this;
        return new Promise((resolve) => {
            self.pool.connect().then((client) => {
                client.query('select status from users where user_id = $1;', [user_id]).then(res => {
                    client.release();
                    let status = res.rowCount > 0 ? res.rows[0].status : true;
                    console.log(`query user ${user_id} notify is ${status}`);
                    resolve(status)
                }).catch((err) => {
                    client.release();
                    console.error('[query error]', err.message, err.stack);
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
                    client.release();
                    let token = res.rowCount > 0 ? res.rows[0].token : null;
                    console.log(`query user token ${token}`);
                    resolve(token)
                }).catch((err) => {
                    client.release();
                    console.error('[query error]', err.message, err.stack);
                    resolve(null)
                })
            })
        })
    }

    getUserIDByToken(token) {
        let self = this;
        return new Promise((resolve) => {
            self.pool.connect().then((client) => {
                client.query('select user_id from users where token = $1;', [token]).then(res => {
                    client.release();
                    let user_id = res.rowCount > 0 ? res.rows[0].user_id : -1;
                    console.log(`query user id ${user_id}`);
                    resolve(user_id)
                }).catch((err) => {
                    client.release();
                    console.error('[query error]', err.message, err.stack);
                    resolve(-1)
                })
            })
        })
    }
}

module.exports = UsersDB;