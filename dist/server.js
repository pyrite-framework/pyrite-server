"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const express = require("express");
const fs = require("fs");
class Server {
    constructor(params) {
        Server.app = express();
        Server.app.use(bodyParser.json());
        this.port = params.port;
        this.routesPath = params.routes;
    }
    loadRoutes() {
        fs.readdirSync(__dirname + this.routesPath).forEach((file) => {
            require(__dirname + this.routesPath + '/' + file);
        });
    }
    listen(cb) {
        this.loadRoutes();
        setTimeout(() => {
            Server.app.listen(this.port, cb.bind({}, this.port));
        });
    }
}
exports.Server = Server;
const server = new Server({
    port: 8080,
    routes: '/routes'
});
server.listen((port) => {
    console.log(`Example app listening on port ${port}!`);
});
