"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
class ActionHandler {
    constructor(target, method, path, types, action) {
        this.target = target;
        this.method = method;
        this.path = path;
        this.types = types;
        this.action = action;
        console.log(`Loading: ${action.toUpperCase()} ${target.rootPath + path}`);
        let befores = [];
        if (target[method] && target[method].before)
            befores = befores.concat(target[method].before);
        if (target.beforeAll)
            befores = target.beforeAll.concat(befores);
        befores.push(this.middleware.bind(this));
        index_1.Server.app[action](target.rootPath + path, ...befores);
    }
    middleware(req, res) {
        let parameters = this.getOrder(this.target[this.method].parameters, req);
        console.log(`${this.action.toUpperCase()} ${this.target.rootPath + this.path}`);
        try {
            let result = this.target[this.method](...parameters);
            if (this.target[this.method].after) {
                result = this.target[this.method].after.reduce((prev, next) => next(prev), result);
            }
            res.status(this.target[this.method].status || 200).send(result);
        }
        catch (error) {
            res.status(error.status || 500).send(error.result);
        }
    }
    setTypes(path, types, parameters) {
        const routes = path.split("/");
        let paramNumber = 0;
        routes.forEach((route) => {
            if (route[0] === ":") {
                const key = route.substring(1, route.length);
                parameters[key] = types[paramNumber](parameters[key]);
                paramNumber++;
            }
        });
        return parameters;
    }
    getOrder(parameters, request) {
        if (!parameters)
            return [];
        if (this.types.length)
            this.setTypes(this.path, this.types, request.params);
        return parameters.map((parameter) => {
            if (parameter.key)
                return request[parameter.param][parameter.key];
            return request[parameter.param];
        });
    }
}
exports.Get = (path, ...types) => handler("get", path, types);
exports.Post = (path, ...types) => handler("post", path, types);
exports.Put = (path, ...types) => handler("put", path, types);
exports.Delete = (path, ...types) => handler("delete", path, types);
exports.Head = (path, ...types) => handler("head", path, types);
function handler(action, path, types) {
    return function (target, method, descriptor) {
        setTimeout(() => new ActionHandler(target, method, path, types, action));
    };
}
