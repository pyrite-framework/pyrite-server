"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const server = new src_1.Server({
    port: 8000,
    routes: __dirname + "/routes"
});
server.listen(() => {
    console.log("Server running!");
});
