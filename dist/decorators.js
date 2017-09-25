"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
function Route(path) {
    return function (target, method, descriptor) {
        target.prototype.rootPath = path;
    };
}
exports.Route = Route;
function Get(path, type) {
    return function (target, method, descriptor) {
        setTimeout(() => {
            console.log('Loading: GET ' + target.rootPath + path);
            server_1.Server.app.get(target.rootPath + path, function (req, res) {
                const parameters = getOrder(target[method].parameters, req);
                console.log(method + ' GET ' + target.rootPath + path);
                const result = target[method](...parameters);
                res.send(result);
            });
        });
    };
}
exports.Get = Get;
function Post(path) {
    return function (target, method, descriptor) {
        setTimeout(() => {
            console.log('Loading: POST ' + target.rootPath + path);
            server_1.Server.app.post(target.rootPath + path, function (req, res) {
                const parameters = getOrder(target[method].parameters, req);
                console.log(method + ' POST ' + target.rootPath + path);
                const result = target[method](...parameters);
                res.send(result);
            });
        });
    };
}
exports.Post = Post;
function getOrder(parameters, request) {
    if (!parameters)
        return [];
    return parameters.map((params) => request[params]);
}
function Query(target, method, descriptor) {
    if (!target[method].parameters)
        target[method].parameters = [];
    target[method].parameters.push('query');
}
exports.Query = Query;
function Params(target, method, descriptor) {
    if (!target[method].parameters)
        target[method].parameters = [];
    target[method].parameters.push('params');
}
exports.Params = Params;
function Body(target, method, descriptor) {
    if (!target[method].parameters)
        target[method].parameters = [];
    target[method].parameters.push('body');
}
exports.Body = Body;
