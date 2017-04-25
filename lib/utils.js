'use strict'
class Utils {
    static SaveConfig(config) {
        var yaml = require('js-yaml')
        var fs = require('fs')

        var path = './config.yaml'
        if (!fs.existsSync(path)) path = __dirname + '/config.yaml'

        var str = yaml.dump(config)
        fs.writeFile(path, str)
    }
}

module.exports = Utils