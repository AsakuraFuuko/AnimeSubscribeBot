'use strict';

module.exports = (msg) => {
    let date = new Date().now().toString('yy-MM-dd HH:mm:ss');
    console.log(`[${date}] msg`)
};