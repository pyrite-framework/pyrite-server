"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
