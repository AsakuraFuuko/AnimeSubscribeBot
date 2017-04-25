'use strict'
const debug = require('debug')('anime')
const Request = require('request')
const parser = require('rss-parser')
const util = require('util')
const dateFormat = require('dateformat')

class Anime {
    fetchRSS(query) {
        return new Promise((resolve, reject) => {
            Request.get(encodeURI(util.format(Anime.url, query)), (err, res, body) => {
                if (!err && res.statusCode == 200) {
                    // debug(body)
                    this._parse(body).then((results) => { resolve(results) })
                } else {
                    reject(err)
                }
            })
        })
    }

    _parse(body) {
        return new Promise((resolve, reject) => {
            parser.parseString(body, (err, parsed) => {
                let results = []
                if (!err) {
                    for (var obj of parsed.feed.entries) {
                        let result = {}
                        result.title = obj.title
                        result.magnet = obj.enclosure.url
                        result.category = obj.categories[0]._
                        result.url = obj.link
                        result.date = obj.pubDate
                        result.torrent = `https://dl.dmhy.org/${dateFormat(new Date(obj.pubDate), 'yyyy/mm/dd')}/${this._btih_base32_to_hex(result.magnet.substr('magnet:?xt=urn:btih:'.length, 32))}.torrent`
                        results.push(result)
                    }
                }
                resolve(results)
            })
        })
    }

    // Base32到hex的转换函数，注意这里的转换不支持pad，因为磁链中用到的Base32不包含pad
    _btih_base32_to_hex(base32) {
        var chunk = base32.match(/(.{4})/g)
        chunk = chunk.map((base32) => {
            var dict = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
            var x = 0
            base32.split('').map((c) => {
                x = x * 32 + dict.indexOf(c)
            })
            return x.toString(16)
        })
        return chunk.map((obj) => {
            return '0'.repeat(5 - obj.length) + obj
        }).join('')
    }
}

Anime.url = "http://dmhy.ricterz.me/topics/rss/rss.xml?keyword=%s&sort_id=2"

module.exports = Anime
