'use strict';
const express = require('express');

class Server {
    constructor(host, port, db) {
        this.host = host;
        this.port = port;
        this.db = db;
        this.app = express();
        this._router()
    }

    _router() {
        this.app.get('/episodes/:token', (req, res) => {
            this.db.users.getUserIDByToken(req.params.token).then((user_id) => {
                this.db.episodes.getAllEpisode(user_id).then((episodes) => {
                    res.json(episodes)
                })
            })
        });

        this.app.delete('/episode/:id', (req, res) => {
            this.db.episodes.deleteEpisode(req.params.id).then((result) => {
                res.json({result: result})
            })
        })
    }

    startListen() {
        let server = this.app.listen(this.port, this.host, () => {
            let host = server.address().address;
            let port = server.address().port;
            console.log(`[Server] start listen on http://${host}:${port}`)
        })
    }
}

module.exports = Server;