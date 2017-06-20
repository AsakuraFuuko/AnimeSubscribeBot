'use strict';
const generateId = require('time-uuid');
const DataBase = require('./database');

class UsersDB extends DataBase {
    fetchAllUserId() {
        return this.pool.query('select * from users;').then(res => {
            console.log(`query ${res.rowCount} users`);
            return res.rowCount > 0 ? res.rows : []
        }).catch((err) => {
            console.error('[query error]', err.message, err.stack);
            return []
        })
    }

    setNotification(user_id, status = true) {
        return this.pool.query('insert into users (user_id, status, token) values ($1, $2, $3) on conflict (user_id) do update set status = $2 returning token;', [user_id, status, generateId()]).then(res => {
            console.log(`set user ${user_id} notify is ${status} with token ${res.rows[0].token}`);
            return true
        }).catch((err) => {
            console.error('[query error]', err.message, err.stack);
            return false
        })
    }

    isNotification(user_id) {
        return this.pool.query('select status from users where user_id = $1;', [user_id]).then(res => {
            let status = res.rowCount > 0 ? res.rows[0].status : true;
            console.log(`query user ${user_id} notify is ${status}`);
            return status
        }).catch((err) => {
            console.error('[query error]', err.message, err.stack);
            return true
        })
    }

    getTokenByUserID(user_id) {
        return this.pool.query('select token from users where user_id = $1;', [user_id]).then(res => {
            let token = res.rowCount > 0 ? res.rows[0].token : null;
            console.log(`query user token ${token}`);
            return token
        }).catch((err) => {
            console.error('[query error]', err.message, err.stack);
            return null
        })
    }

    getUserIDByToken(token) {
        return this.pool.query('select user_id from users where token = $1;', [token]).then(res => {
            let user_id = res.rowCount > 0 ? res.rows[0].user_id : -1;
            console.log(`query user id ${user_id}`);
            return user_id
        }).catch((err) => {
            console.error('[query error]', err.message, err.stack);
            return -1
        })
    }
}

module.exports = UsersDB;