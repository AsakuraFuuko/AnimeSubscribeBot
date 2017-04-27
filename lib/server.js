'use strict'
const express = require('express')

class Server {
    constructor(host, port, db) {
        this.host = host
        this.port = port
        this.db = db
        this.app = express()
        this._router()
    }

    _router() {
        this.app.get('/episodes/:token', (req, res) => {
            this.db.users.getUserIDByToken(req.params.token).then((user_id) => {
                this.db.episodes.getAllEpisode(user_id).then((episodes) => {
                    res.json({ status: false, result: episodes })
                })
            }).catch((err) => {
                res.json({ status: false, result: err })
            })
        })

        this.app.delete('/episode/:id', (req, res) => {
            this.db.episodes.deleteEpisode(req.params.id).then((result) => {
                res.json({ status: result })
            })
        })
    }

    startListen() {
        let server = this.app.listen(this.port, this.host, () => {
            var host = server.address().address
            var port = server.address().port
            console.log(`[Server] start listen on http://${host}:${port}`)
        })
    }
}

module.exports = Server