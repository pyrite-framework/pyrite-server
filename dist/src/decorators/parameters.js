"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function Headers(target, method, descriptor) {
    return getParameters(target[method], "headers");
}
exports.Headers = Headers;
function Cookies(target, method, descriptor) {
    return getParameters(target[method], "cookies");
}
exports.Cookies = Cookies;
function Session(target, method, descriptor) {
    return getParameters(target[method], "session");
}
exports.Session = Session;
function Body(target, method, descriptor) {
    return getParameters(target[method], "body");
}
exports.Body = Body;
function Query(targetDefault, method, descriptor, key) {
    if (!method)
        return (target, method, descriptor) => Query(target, method, descriptor, targetDefault);
    return getParameters(targetDefault[method], "query", key);
}
exports.Query = Query;
function Params(targetDefault, method, descriptor, key) {
    if (!method)
        return (target, method, descriptor) => Params(target, method, descriptor, targetDefault);
    return getParameters(targetDefault[method], "params", key);
}
exports.Params = Params;
function getParameters(target, param, key) {
    if (!target.parameters)
        target.parameters = [];
    target.parameters.unshift({
        param, key
    });
}
