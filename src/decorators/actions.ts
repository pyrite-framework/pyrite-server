import { Server } from "../index";

class ActionHandler {
  constructor (private target, private method, private path, private types, private action) {
    console.log(`Loading: ${action.toUpperCase()} ${target.rootPath + path}`);

    let befores = [];

    if (target[method] && target[method].before) befores = befores.concat(target[method].before);
    if (target.beforeAll) befores = target.beforeAll.concat(befores);

    befores.push(this.middleware.bind(this));

    Server.app[action](target.rootPath + path, ...befores);
  }

  private middleware (req, res) {
    let parameters = this.getOrder(this.target[this.method].parameters, req);

    console.log(`${this.action.toUpperCase()} ${this.target.rootPath + this.path}`);

    try {
      let result = this.target[this.method](...parameters);

      if (this.target[this.method].after) {
        result = this.target[this.method].after.reduce((prev, next) => next(prev), result);
      }

      res.status(this.target[this.method].status || 200).send(result);
    } catch (error) {
      res.status(error.status || 500).send(error.result);
    }
  }

  private setTypes (path: string, types: Array<any>, parameters: Array<any>): Array<any> {
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

  private getOrder (parameters: Array<any>, request): Array<any> {
    if (!parameters) return [];
    if (this.types.length) this.setTypes(this.path, this.types, request.params);

    return parameters.map((parameter) => {
      if (parameter.key) return request[parameter.param][parameter.key];
      return request[parameter.param];
    });
  }
}

export const Get = (path, ...types): Function => handler("get", path, types);
export const Post = (path, ...types): Function => handler("post", path, types);
export const Put = (path, ...types): Function => handler("put", path, types);
export const Delete = (path, ...types): Function => handler("delete", path, types);
export const Head = (path, ...types): Function => handler("head", path, types);

function handler (action, path, types): Function {
  return function (target, method, descriptor): void {
    setTimeout(() => new ActionHandler(target, method, path, types, action));
  }
}
