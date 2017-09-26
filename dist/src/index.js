"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const fs = require("fs");
const Actions = require("./decorators/actions");
const General = require("./decorators/general");
const Parameters = require("./decorators/parameters");
;
;
class Server {
    constructor(params) {
        this.params = params;
        Server.app = express();
        Server.app.use(bodyParser.json());
        Server.app.use(cookieParser());
        if (params.config)
            this.config(params.config);
    }
    loadRoutes() {
        fs.readdirSync(this.params.routes).forEach((file) => {
            require(`${this.params.routes}/${file}`);
        });
    }
    configCallback() { }
    config(callbackConfig) {
        this.configCallback = callbackConfig.bind(this, Server.app);
        return this;
    }
    listen(callbackListen) {
        this.loadRoutes();
        this.configCallback();
        setTimeout(() => {
            Server.app.listen(this.params.port, callbackListen);
        });
    }
}
exports.Server = Server;
exports.Get = Actions.Get;
exports.Post = Actions.Post;
exports.Put = Actions.Put;
exports.Delete = Actions.Delete;
exports.Head = Actions.Head;
exports.Route = General.Route;
exports.Status = General.Status;
exports.Exception = General.Exception;
exports.Before = General.Before;
exports.After = General.After;
exports.Headers = Parameters.Headers;
exports.Cookies = Parameters.Cookies;
exports.Session = Parameters.Session;
exports.Query = Parameters.Query;
exports.Params = Parameters.Params;
exports.Body = Parameters.Body;
