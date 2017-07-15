'use strict';
const debug = require('debug')('anime');
const requestPromise = require('request-promise');
const parser = require('rss-parser');
const util = require('util');
const dateFormat = require('dateformat');

class Anime {
    constructor() {
        this.url = 'https://share.dmhy.org/topics/rss/rss.xml';
    }

    fetchRSS(query) {
        let options = {
            url: this.url,
            qs: {
                keyword: query,
                sort_id: 2
            }
        };
        return requestPromise.get(options).then((body) => {
            return this._parse(body)
        })
    }

    _parse(body) {
        return new Promise((resolve) => {
            parser.parseString(body, (err, parsed) => {
                let results = [];
                if (!err) {
                    for (let obj of parsed.feed.entries) {
                        let result = {};
                        result.title = obj.title;
                        result.magnet = obj.enclosure.url;
                        result.category = obj.categories[0]._;
                        result.url = obj.link;
                        result.date = obj.pubDate;
                        if (!result.magnet) {
                            continue;
                        }
                        result.torrent = `https://dl.dmhy.org/${dateFormat(new Date(obj.pubDate), 'yyyy/mm/dd')}/${Anime._btih_base32_to_hex(result.magnet.substr('magnet:?xt=urn:btih:'.length, 32))}.torrent`;
                        results.push(result)
                    }
                } else {
                    debug(err)
                }
                resolve(results)
            })
        })
    }

    // Base32到hex的转换函数，注意这里的转换不支持pad，因为磁链中用到的Base32不包含pad
    static _btih_base32_to_hex(base32) {
        let chunk = base32.match(/(.{4})/g);
        chunk = chunk.map((base32) => {
            let dict = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
            let x = 0;
            base32.split('').map((c) => {
                x = x * 32 + dict.indexOf(c)
            });
            return x.toString(16)
        });
        return chunk.map((obj) => {
            return '0'.repeat(5 - obj.length) + obj
        }).join('')
    }
}

module.exports = Anime;
