export function Headers (target, method, descriptor): void {
  return getParameters(target[method], "headers");
}

export function Cookies (target, method, descriptor): void {
  return getParameters(target[method], "cookies");
}

export function Session (target, method, descriptor): void {
  return getParameters(target[method], "session");
}

export function Body (target, method, descriptor): void {
  return getParameters(target[method], "body");
}

export function Query (targetDefault, method?, descriptor?, key?): any {
  if (!method) return (target, method, descriptor) => Query(target, method, descriptor, targetDefault);

  return getParameters(targetDefault[method], "query", key);
}

export function Params (targetDefault, method?, descriptor?, key?): any {
  if (!method) return (target, method, descriptor) => Params(target, method, descriptor, targetDefault);

  return getParameters(targetDefault[method], "params", key);
}

function getParameters(target, param, key?): void {
  if (!target.parameters) target.parameters = [];
  
  target.parameters.unshift({
    param, key
  });
}
