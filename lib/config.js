'use strict';
const yaml = require('js-yaml');
const fs = require('fs');

let path = './config.yaml';
if (!fs.existsSync(path)) path = __dirname + '/config.yaml';

if (!fs.existsSync(path)) {
    console.log("config.yaml not found at ./ or " + __dirname);
    process.exit(0);
}

let config = fs.readFileSync(path, 'utf8');
module.exports = yaml.load(config);