import { Server } from './index';

function Route (path): Function {
  return function(target, method, descriptor): void {
    target.prototype.rootPath = path;
  };
}

function Status (status): Function {
  return function(target, method, descriptor): void {
    target[method].status = status;
  };
}

function Exception (status, result): any {
  return {
    status, result
  };
}

function handler (action, path, types): Function {
  return function(target, method, descriptor): void {
    function cb (req, res) {
      let parameters = [];

      if (types.length) setTypes(path, types, req.params);

      parameters = getOrder(target[method].parameters, req);

      
      console.log(`${action.toUpperCase()} ${target.rootPath + path}`);

      try {
        let result = target[method](...parameters);

        if (target[method].after) {
          result = target[method].after.reduce((prev, next) => next(prev), result);
        }

        res.status(target[method].status || 200).send(result);
      } catch (error) {
        res.status(error.status || 500).send(error.result);
      }
    }

    setTimeout(() => {
      console.log(`Loading: ${action.toUpperCase()} ${target.rootPath + path}`);

      let befores = [];

      if (target[method] && target[method].before) befores = befores.concat(target[method].before);
      if (target.beforeAll) befores = target.beforeAll.concat(befores);

      befores.push(cb);

      Server.app[action](target.rootPath + path, ...befores);
    });
  }
}

function Before (middleware): Function {
  return function(target, method, descriptor): void {
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

function After (middleware): Function {
  return function(target, method, descriptor): void {
    if (!target[method].after) 
      target[method].after = [];

    target[method].after.unshift(middleware);
  };
}

function Get (path, ...types): Function {
  return handler('get', path, types);
}

function Post (path, ...types): Function {
  return handler('post', path, types);
}

function Put (path, ...types): Function {
  return handler('put', path, types);
}

function Delete (path, ...types): Function {
  return handler('delete', path, types);
}

function Head (path, ...types): Function {
  return handler('head', path, types);
}

function getOrder (parameters, request) {
  if (!parameters) return [];

  return parameters.map((parameter) => {
    if (parameter.key) return request[parameter.param][parameter.key];
    return request[parameter.param];
  });
}

function setTypes (path, types, parameters): void {
  const routes = path.split('/');

  let paramNumber = 0;

  routes.forEach((route) => {
    if (route[0] === ':') {
      const key = route.substring(1, route.length);
      parameters[key] = types[paramNumber](parameters[key]);
      paramNumber++;
    }
  });

  return parameters;
}

function getParameters(target, param, key?): void {
  if (!target.parameters) target.parameters = [];
  
  target.parameters.unshift({
    param, key
  });
}

function Headers (target, method, descriptor): void {
  return getParameters(target[method], 'headers');
}

function Cookies (target, method, descriptor): void {
  return getParameters(target[method], 'cookies');
}

function Session (target, method, descriptor): void {
  return getParameters(target[method], 'session');
}

function Query (targetDefault, method?, descriptor?, key?): any {
  if (!method) return (target, method, descriptor) => Query(target, method, descriptor, targetDefault);

  return getParameters(targetDefault[method], 'query', key);
}

function Params (targetDefault, method?, descriptor?, key?): any {
  if (!method) return (target, method, descriptor) => Params(target, method, descriptor, targetDefault);

  return getParameters(targetDefault[method], 'params', key);
}

function Body (target, method, descriptor): void {
  return getParameters(target[method], 'body');
}

export {Route, Get, Post, Put, Delete, Head, Headers, Session, Body, Query, Params, Before, After, Status, Exception};