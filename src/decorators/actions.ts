import { Request, Response } from "express";
import { Server } from "../index";
import { Emiter } from "../emiter";

interface Middleware {
  (req: Request, res: Response, next: Function): void;
};

interface Parameter {
  param: string;
  key?: string;
};

class ActionHandler {
  emitCallback: Function;

  constructor (private target: any, private method: string, private path: string, private types: Array<StringConstructor|NumberConstructor>, private action: string) {
    console.log(`Loading route: ${action.toUpperCase()} ${target.path}${target[method].path}`);

    let befores: Array<Middleware> = [];

    if (target[method] && target[method].before) befores = befores.concat(target[method].before);
    if (target.beforeAll) befores = target.beforeAll.concat(befores);

    befores.push(this.middleware.bind(this));

    target[method].alias = target[method].alias || target[method].name;

    Server.controllersAllowed[target.alias][target[method].alias] = {
      url: target.path + (target[method].path)
    };

    (<any> Server.app)[action](target.path + target[method].path, ...befores);

    this.emitCallback = Emiter.loadEmit(target, method);
  }

  private middleware (req: Request, res: Response): void {
    let parameters: Array<any> = this.getOrder(this.target[this.method].parameters, req, res);

    console.log(`${this.action.toUpperCase()} ${this.target.path + this.path}`);

    try {
      let result = this.target[this.method](...parameters);

      if (this.target[this.method].after) {
        result = this.target[this.method].after.reduce((prev: Function, next: Function) => next(prev), result);
      }

      if (result && typeof result.then === 'function') {
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

  private getOrder (parameters: Array<any>, request: Request, response: Response): Array<any> {
    if (!parameters) return [];
    if (this.types.length) this.setTypes(this.path, this.types, request.params);

    return parameters.map((parameter: Parameter): any => {
      if (parameter.key) return getDescendantProp((<any> request)[parameter.param], parameter.key);
      else if (parameter.param === 'req') return request;
      else if (parameter.param === 'res') return response;
      else if (parameter.param === 'emit') return this.emitCallback.bind(this, request.headers["pyrite-token"], request.headers["pyrite-id"]);
      
      return (<any> request)[parameter.param];
    });
  }
}

export const Get = (path: string, ...types: Array<StringConstructor|NumberConstructor>): Function => handler("get", path, types);
export const Post = (path: string, ...types: Array<StringConstructor|NumberConstructor>): Function => handler("post", path, types);
export const Put = (path: string, ...types: Array<StringConstructor|NumberConstructor>): Function => handler("put", path, types);
export const Delete = (path: string, ...types: Array<StringConstructor|NumberConstructor>): Function => handler("delete", path, types);
export const Head = (path: string, ...types: Array<StringConstructor|NumberConstructor>): Function => handler("head", path, types);

function handler (action: string, path: string, types: Array<StringConstructor|NumberConstructor>): Function {
  return function (target: any, method: string, descriptor: PropertyDescriptor): void {
    target[method].path = path;
    setTimeout(() => new ActionHandler(target, method, path, types, action));
  }
}

function getDescendantProp(obj: any, desc: string): any {
  const arr = desc.split(".");

  while(arr.length && (obj = obj[arr.shift()]));

  return obj;
}