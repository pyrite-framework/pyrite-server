"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const fs = require("fs");
class Server {
    constructor(params) {
        Server.app = express();
        Server.app.use(bodyParser.json());
        Server.app.use(cookieParser());
        this.port = params.port;
        this.routesPath = params.routes;
        if (params.config)
            this.config(params.config);
    }
    __loadRoutes() {
        fs.readdirSync(this.routesPath).forEach((file) => {
            require(this.routesPath + '/' + file);
        });
    }
    config(cb) {
        this.__config = cb.bind(this, Server.app);
        return this;
    }
    listen(cb) {
        this.__loadRoutes();
        if (this.__config)
            this.__config();
        setTimeout(() => {
            Server.app.listen(this.port, cb.bind({}, this.port));
        });
    }
}
exports.Server = Server;
