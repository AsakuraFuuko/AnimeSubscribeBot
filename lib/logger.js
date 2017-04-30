'use strict';
const dateFormat = require('dateformat');

module.exports = (msg) => {
    let date = dateFormat(new Date(), 'yy-MM-dd HH:mm:ss');
    console.log(`[${date}] msg`)
};