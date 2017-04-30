'use strict';
class Utils {
    static SaveConfig(config) {
        let yaml = require('js-yaml');
        let fs = require('fs');

        let path = './config.yaml';
        if (!fs.existsSync(path)) path = __dirname + '/config.yaml';

        let str = yaml.dump(config);
        fs.writeFile(path, str)
    }

    /**
     * @return {string}
     */
    static GenToken() {
        // set the length of the string
        let stringLength = 15;
        // list containing characters for the random string
        let stringArray = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        let rndString = "";
        // build a string with random characters
        for (let i = 1; i < stringLength; i++) {
            rndString += Math.ceil(Math.random() * stringArray.length) - 1
        }
        return rndString
    }

    static UniqueBy(a, key) {
        let seen = new Set();
        return a.filter(item => {
            let k = key(item);
            return seen.has(k) ? false : seen.add(k);
        });
    }
}

module.exports = Utils;