import { Request, Response } from "express";
import { Server } from "../index";

interface Middleware {
  (req: Request, res: Response, next: Function): void;
};

export function Alias (name: string): Function {
  return function(target: any, method: string, descriptor: PropertyDescriptor): void {
    target[method].alias = name;
  };
}

export function Route (path: string, alias?: string): Function {
  return function(target: any, method: string, descriptor: PropertyDescriptor): void {
    target.prototype.path = alias ? '/' + alias : path;
    target.prototype.alias = alias || target.name;

    Server.controllersAllowed[target.prototype.alias] = {};
  }
};

export function Status (status: number): Function {
  return function(target: any, method: string, descriptor: PropertyDescriptor): void {
    target[method].status = status;
  };
}

export function Before (middleware: Middleware): Function {
  return function(target: any, method: string, descriptor: PropertyDescriptor): void {
    let befores = [];

    if (!method) {
      if (!target.prototype.beforeAll) befores = target.prototype.beforeAll = [];

      return target.prototype.beforeAll.unshift(middleware);
    }

    if (method && !target[method].before) {
      target[method].before = [];
    }

    target[method].before.unshift(middleware);
  };
}

export function After (middleware: Function): Function {
  return function(target: any, method: string, descriptor: PropertyDescriptor): void {
    if (!target[method].after) target[method].after = [];

    target[method].after.unshift(middleware);
  };
}

export function Emits (target: any, method: string, descriptor: PropertyDescriptor): void {
  target[method].emits = true;
  target[method].emitsTo = target[method].name;
}

export function Broadcast (target: any, method: string, descriptor: PropertyDescriptor): void {
  target[method].broadcast = true;
  target[method].broadcastTo = target[method].name;
}
