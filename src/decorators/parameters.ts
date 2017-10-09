export function Request (targetDefault: any, method?: string, descriptor?: any, key?: string): any {
  if (!method) return (target: any, method: string, descriptor: any) => Request(target, method, descriptor, targetDefault);

  setParameters(targetDefault[method], "req", key);
}

export function Response (targetDefault: any, method?: string, descriptor?: any, key?: string): any {
  if (!method) return (target: any, method: string, descriptor: any) => Response(target, method, descriptor, targetDefault);

  setParameters(targetDefault[method], "res", key);
}

export function Headers (targetDefault: any, method?: string, descriptor?: any, key?: string): any {
  if (!method) return (target: any, method: string, descriptor: any) => Headers(target, method, descriptor, targetDefault);

  setParameters(targetDefault[method], "headers", key);
}

export function Cookies (targetDefault: any, method?: string, descriptor?: any, key?: string): any {
  if (!method) return (target: any, method: string, descriptor: any) => Cookies(target, method, descriptor, targetDefault);

  setParameters(targetDefault[method], "cookies", key);
}

export function Session (targetDefault: any, method?: string, descriptor?: any, key?: string): any {
  if (!method) return (target: any, method: string, descriptor: any) => Session(target, method, descriptor, targetDefault);

  setParameters(targetDefault[method], "session", key);
}

export function Body (targetDefault: any, method?: string, descriptor?: any, key?: string): any {
  if (!method) return (target: any, method: string, descriptor: any) => Body(target, method, descriptor, targetDefault);

  setParameters(targetDefault[method], "body", key);
}

export function Query (targetDefault: any, method?: string, descriptor?: any, key?: string): any {
  if (!method) return (target: any, method: string, descriptor: any) => Query(target, method, descriptor, targetDefault);

  setParameters(targetDefault[method], "query", key);
}

export function Params (targetDefault: any, method?: string, descriptor?: any, key?: string): any {
  if (!method) return (target: any, method: string, descriptor: any) => Params(target, method, descriptor, targetDefault);

  setParameters(targetDefault[method], "params", key);
}

export function Emit (target: any, method: string, descriptor: any): void {
  setParameters(target[method], "emit");
}

function setParameters(target: any, param: string, key?: string): void {
  if (!target.parameters) target.parameters = [];
  
  target.parameters.unshift({
    param, key
  });
}
