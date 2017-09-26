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
const src_1 = require("../../src");
const users = [];
let index = 0;
let Users = class Users {
    getUsers(name) {
        return users.filter((user) => !name || user.name === name);
    }
    createUser(user) {
        user.id = index++;
        users.push(user);
        return user;
    }
    getUser(id) {
        const user = users.find((user) => user.id === id);
        if (!user)
            throw src_1.Exception(404, "not_found");
        return user;
    }
    updateUser(id, user) {
        const foundUser = users.find((user) => user.id === id);
        if (!user)
            throw src_1.Exception(404, "not_found");
        Object.assign(foundUser, user);
        return user;
    }
    removeUser(id) {
        const indexUser = users.findIndex((user) => user.id === id);
        if (indexUser === -1)
            throw src_1.Exception(404, "not_found");
        users.splice(indexUser, 1);
        return true;
    }
};
__decorate([
    src_1.Get("/"),
    __param(0, src_1.Query("name"))
], Users.prototype, "getUsers", null);
__decorate([
    src_1.Post("/"),
    __param(0, src_1.Body)
], Users.prototype, "createUser", null);
__decorate([
    src_1.Get("/:id", Number),
    __param(0, src_1.Params("id"))
], Users.prototype, "getUser", null);
__decorate([
    src_1.Put("/:id", Number),
    __param(0, src_1.Params("id")), __param(1, src_1.Body)
], Users.prototype, "updateUser", null);
__decorate([
    src_1.Delete("/:id", Number),
    __param(0, src_1.Params("id"))
], Users.prototype, "removeUser", null);
Users = __decorate([
    src_1.Route("/users")
], Users);
