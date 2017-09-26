"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
function Route(path) {
    return function (target, method, descriptor) {
        target.prototype.rootPath = path;
    };
}
exports.Route = Route;
function Status(status) {
    return function (target, method, descriptor) {
        target[method].status = status;
    };
}
exports.Status = Status;
function Exception(status, result) {
    return {
        status, result
    };
}
exports.Exception = Exception;
function handler(action, path, types) {
    return function (target, method, descriptor) {
        function cb(req, res) {
            let parameters = [];
            if (types.length)
                setTypes(path, types, req.params);
            parameters = getOrder(target[method].parameters, req);
            console.log(`${action.toUpperCase()} ${target.rootPath + path}`);
            try {
                let result = target[method](...parameters);
                if (target[method].after) {
                    result = target[method].after.reduce((prev, next) => next(prev), result);
                }
                res.status(target[method].status || 200).send(result);
            }
            catch (error) {
                res.status(error.status || 500).send(error.result);
            }
        }
        setTimeout(() => {
            console.log(`Loading: ${action.toUpperCase()} ${target.rootPath + path}`);
            let befores = [];
            if (target[method] && target[method].before)
                befores = befores.concat(target[method].before);
            if (target.beforeAll)
                befores = target.beforeAll.concat(befores);
            befores.push(cb);
            index_1.Server.app[action](target.rootPath + path, ...befores);
        });
    };
}
function Before(middleware) {
    return function (target, method, descriptor) {
        let befores = [];
        if (!method) {
            if (!target.prototype.beforeAll)
                befores = target.prototype.beforeAll = [];
            return target.prototype.beforeAll.unshift(middleware);
        }
        if (method && !target[method].before) {
            target[method].before = [];
        }
        target[method].before.unshift(middleware);
    };
}
exports.Before = Before;
function After(middleware) {
    return function (target, method, descriptor) {
        if (!target[method].after)
            target[method].after = [];
        target[method].after.unshift(middleware);
    };
}
exports.After = After;
function Get(path, ...types) {
    return handler('get', path, types);
}
exports.Get = Get;
function Post(path, ...types) {
    return handler('post', path, types);
}
exports.Post = Post;
function Put(path, ...types) {
    return handler('put', path, types);
}
exports.Put = Put;
function Delete(path, ...types) {
    return handler('delete', path, types);
}
exports.Delete = Delete;
function Head(path, ...types) {
    return handler('head', path, types);
}
exports.Head = Head;
function getOrder(parameters, request) {
    if (!parameters)
        return [];
    return parameters.map((parameter) => {
        if (parameter.key)
            return request[parameter.param][parameter.key];
        return request[parameter.param];
    });
}
function setTypes(path, types, parameters) {
    const routes = path.split('/');
    let paramNumber = 0;
    routes.forEach((route) => {
        if (route[0] === ':') {
            const key = route.substring(1, route.length);
            parameters[key] = types[paramNumber](parameters[key]);
            paramNumber++;
        }
    });
    return parameters;
}
function getParameters(target, param, key) {
    if (!target.parameters)
        target.parameters = [];
    target.parameters.unshift({
        param, key
    });
}
function Headers(target, method, descriptor) {
    return getParameters(target[method], 'headers');
}
exports.Headers = Headers;
function Cookies(target, method, descriptor) {
    return getParameters(target[method], 'cookies');
}
function Session(target, method, descriptor) {
    return getParameters(target[method], 'session');
}
exports.Session = Session;
function Query(targetDefault, method, descriptor, key) {
    if (!method)
        return (target, method, descriptor) => Query(target, method, descriptor, targetDefault);
    return getParameters(targetDefault[method], 'query', key);
}
exports.Query = Query;
function Params(targetDefault, method, descriptor, key) {
    if (!method)
        return (target, method, descriptor) => Params(target, method, descriptor, targetDefault);
    return getParameters(targetDefault[method], 'params', key);
}
exports.Params = Params;
function Body(target, method, descriptor) {
    return getParameters(target[method], 'body');
}
exports.Body = Body;
