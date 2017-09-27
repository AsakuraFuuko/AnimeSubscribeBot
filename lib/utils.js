'use strict';
const {sify} = require('chinese-conv');
const uax11 = require('uax11');

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

    static ParseEpisode(data) {
        let ep = [];
        let regexs = [/[第]\s?(\d{1,3})\s?[話|话|集]/i, /(?:【|\[|ep)(\d+)\s?(?:END|完)?(?:】|])/i, /^([\d]{2,})$/i, /^(\d+)-(\d+)/i];
        for (let sp of ['【', '[', ' ']) {
            for (let str of data.split(sp)) {
                for (let reg of regexs) {
                    let matchs = str.match(reg);
                    if (matchs) {
                        for (let i = 1; i < matchs.length; i++) {
                            ep.push(parseInt(matchs[i]))
                        }
                        return {ep: ep, name: data}
                    }
                }
            }
        }
        return {ep: ep, name: data}
    }

    static ArrayToArrays(array, length) {
        let tempArrays = [];
        let tempArray = [];
        for (let i = 0; i < array.length; i++) {
            if (i !== 0 && i % length === 0) {
                tempArrays.push(tempArray);
                tempArray = [array[i]]
            } else {
                tempArray.push(array[i])
            }
        }
        tempArrays.push(tempArray);
        return tempArrays
    }

    static IsTitleMatch(title, keywords) {
        title = sify(title.toLowerCase());
        title = uax11.toHalfwidth(title);

        let match = true;
        for (let keyword of keywords.split(' ')) {
            keyword = sify(keyword.toLowerCase());
            keyword = uax11.toHalfwidth(keyword);
            match = match && title.includes(keyword);
        }
        return match;
    }
}

module.exports = Utils;