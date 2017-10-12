import { Request, Response } from "express";
import { Server } from "../index";

interface Middleware {
  (req: Request, res: Response, next: Function): void;
};

interface Parameter {
  param: string;
  key?: string;
};

class ActionHandler {
  emitCallback: Function;

  constructor (private target: any, private method: string, private path: any, private types: Array<any>, private action: string) {
    target[method].path = path || "/" + target[method].name;
    console.log(`Loading route: ${action.toUpperCase()} ${target.path}${target[method].path}`);

    let befores: Array<Middleware> = [];

    if (target[method] && target[method].before) befores = befores.concat(target[method].before);
    if (target.beforeAll) befores = target.beforeAll.concat(befores);

    befores.push(this.middleware.bind(this));

    target[method].alias = target[method].alias || target[method].name;

    Server.controllersAllowed[target.alias][target[method].alias] = {
      url: target.path + (target[method].path),
      action: action.toUpperCase(),
      validations: target[method].validations
    };

    (<any> Server.app)[action](target.path + target[method].path, ...befores);

    const emitter = this.loadMiddlewareEmitter();

    if (emitter) this.emitCallback = emitter.loadEmit(target, method);
  }

  private loadMiddlewareEmitter(): any {
    return Server.plugins.find((plugin: any) => plugin.type === "emitter");
  }

  private loadMiddlewarePlugins (req: Request, res: Response): Boolean {
    return Server.plugins
    .filter((plugin: any) => plugin.type === "middleware")
    .some((plugin: any): any => plugin.run(req, res, this.target, this.method));
  }

  private middleware (req: Request, res: Response): void {
    const failSome = this.loadMiddlewarePlugins(req, res);
    if (failSome) return;

    let parameters: Array<any> = this.getOrder(this.target[this.method], req, res);

    console.log(`${this.action.toUpperCase()} ${this.target.path + this.target[this.method].path}`);

    try {
      let result = this.target[this.method](...parameters);

      if (this.target[this.method].after) {
        result = this.target[this.method].after.reduce((prev: Function, next: Function) => next(prev), result);
      }

      if (result && typeof result.then === "function") {
        result.then((promisedResult) => {
          res.status(this.target[this.method].status || 200).send(promisedResult);
        })
        .catch((error) => {
          console.log(error);
          res.status(error.status || 500).send(error.result);
        })
      } else {
        res.status(this.target[this.method].status || 200).send(result);
      }
    } catch (error) {
      console.log(error);

      res.status(error.status || 500).send(error.result);
    }
  }

  private setTypes (path: string, types: Array<any>, parameters: any): Array<any> {
    const routes = path.split("/");

    let paramNumber = 0;

    routes.forEach((route: string) => {
      if (route[0] === ":") {
        const key = route.substring(1, route.length);
        parameters[key] = types[paramNumber](parameters[key]);
        paramNumber++;
      }
    });

    return parameters;
  }

  private getOrder (target: any, request: Request, response: Response): Array<any> {
    const parameters = target.parameters;
    const path = target.path;

    if (!parameters) return [request, response];
    if (this.types.length) this.setTypes(path, this.types, request.params);

    return parameters.map((parameter: Parameter): any => {
      if (parameter.param === "request") return getDescendantProp(request, parameter.key);
      else if (parameter.param === "response") return getDescendantProp(response, parameter.key);
      else if (parameter.param === "emit") return this.emitCallback.bind(this, request.headers["pyrite-token"], request.headers["pyrite-id"]);
      else if (parameter.key) return getDescendantProp((<any> request)[parameter.param], parameter.key);

      return (<any> request)[parameter.param];
    });
  }
}

export const Get = (path?: any, ...types: Array<any>): any => handler("get", path, types);
export const Post = (path?: any, ...types: Array<any>): any => handler("post", path, types);
export const Put = (path?: any, ...types: Array<any>): any => handler("put", path, types);
export const Delete = (path?: any, ...types: Array<any>): any => handler("delete", path, types);
export const Head = (path?: any, ...types: Array<any>): any => handler("head", path, types);

function handler (action: string, path: any, types: Array<any>): any {
  if (typeof path === "object") {
    return setTimeout(() => new ActionHandler(path, types[0], null, [], action));
  }

  return function (target: any, method: string, descriptor: PropertyDescriptor): void {
    setTimeout(() => new ActionHandler(target, method, path, types, action));
  }
}

function getDescendantProp(obj: any, desc: string): any {
  const arr = desc.split(".");

  while(arr.length && (obj = obj[arr.shift()]));

  return obj;
}