export function Route (path: string): Function {
  return function(target, method, descriptor): void {
    target.prototype.rootPath = path;
  };
}

export function Status (status: number): Function {
  return function(target, method, descriptor): void {
    target[method].status = status;
  };
}

export function Exception (status: number, result: any): { status: number, result: any } {
  return {
    status, result
  };
}

export function Before (middleware): Function {
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

export function After (middleware): Function {
  return function(target, method, descriptor): void {
    if (!target[method].after) target[method].after = [];

    target[method].after.unshift(middleware);
  };
}