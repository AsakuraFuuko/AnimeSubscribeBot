'use strict';
const DataBase = require('./database');

class SettingsDB extends DataBase {
    constructor() {
        super();
        this.settingdb = this.db.collection('animesub_settings')
    }

    setSetting(key, value, group_id = -1) {
        return this.settingdb.findAndModify({
            query: {key, group_id},
            update: {$set: {value, key, group_id}},
            upsert: true,
            new: true
        })
    }

    getSetting(key, group_id = -1, defaults = null) {
        return this.settingdb.findOne({key, group_id}).then((doc) => doc ? doc.value : defaults)
    }

    deleteSetting(key, group_id = -1) {
        return this.settingdb.remove({key, group_id}).then((numRemoved) => numRemoved === 1)
    }

    addUserToWhiteList(user_id) {
        return this.settingdb.findOne({key: 'whitelist'}).then(doc => {
            user_id = parseInt(user_id);
            if (doc) {
                let value = doc.value;
                if (!value.includes(user_id)) {
                    value.push(user_id)
                }
                return this.settingdb.update({key: 'whitelist'}, {value})
            } else {
                return this.settingdb.insert({key: 'whitelist', value: [user_id]})
            }
        })
    }

    removeUserFromWhiteList(user_id) {
        return this.settingdb.findOne({key: 'whitelist'}).then(doc => {
            user_id = parseInt(user_id);
            if (doc) {
                let value = doc.value;
                if (value.includes(user_id)) {
                    value = value.filter(user => user !== user_id)
                }
                return this.settingdb.update({key: 'whitelist'}, {value: value})
            }
        })
    }

    hasUserFromWhiteList(user_id) {
        return this.settingdb.findOne({key: 'whitelist'}).then(doc => {
            user_id = parseInt(user_id);
            if (doc) {
                let value = doc.value;
                if (value.includes(user_id)) {
                    return true
                }
            }
            return false
        })
    }
}

module.exports = SettingsDB;
