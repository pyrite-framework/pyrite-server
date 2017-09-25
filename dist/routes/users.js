"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const decorators_1 = require("../decorators");
const users = [];
let index = 0;
let Users = class Users {
    getUsers(query) {
        return users.filter((user) => !query.name || user.name === query.name);
    }
    getUser(params) {
        return users.find((user) => user.id == params.id);
    }
    createUser(body) {
        body.id = index++;
        users.push(body);
        return true;
    }
};
__decorate([
    decorators_1.Get('/'),
    __param(0, decorators_1.Query)
], Users.prototype, "getUsers", null);
__decorate([
    decorators_1.Get('/:id', Number),
    __param(0, decorators_1.Params)
], Users.prototype, "getUser", null);
__decorate([
    decorators_1.Post('/'),
    __param(0, decorators_1.Body)
], Users.prototype, "createUser", null);
Users = __decorate([
    decorators_1.Route('/users')
], Users);
