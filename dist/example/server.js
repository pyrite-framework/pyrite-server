"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const server = new src_1.Server({
    port: 8080,
    routes: __dirname + '/routes'
});
server.listen((port) => {
    console.log(`Server listening on port ${port}!`);
});
