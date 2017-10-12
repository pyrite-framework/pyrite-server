export const Request = (target: any, method?: string, descriptor?: any): any => {
  return setParametersType("request", target, method, descriptor);
}

export const Response = (target: any, method?: string, descriptor?: any): any => {
  return setParametersType("response", target, method, descriptor);
}

export const Headers = (target: any, method?: string, descriptor?: any): any => {
  return setParametersType("headers", target, method, descriptor);
}

export const Cookies = (target: any, method?: string, descriptor?: any): any => {
  return setParametersType("cookies", target, method, descriptor);
}

export const Session = (target: any, method?: string, descriptor?: any): any => {
  return setParametersType("session", target, method, descriptor);
}

export const Body = (target: any, method?: string, descriptor?: any): any => {
  return setParametersType("body", target, method, descriptor);
}

export const Query = (target: any, method?: string, descriptor?: any): any => {
  return setParametersType("query", target, method, descriptor);
}

export const Params = (target: any, method?: string, descriptor?: any): any => {
  return setParametersType("params", target, method, descriptor);
}

function setParametersType(type: string, targetDefault: any, method?: string, descriptor?: any, key?: string): any {
  if (!method) return (target: any, method: string, descriptor: any) => {
    return setParametersType(type, target, method, descriptor, targetDefault);
  }

  return setParameters(targetDefault[method], type, key);
}

function setParameters(target: any, param: string, key?: string): void {
  if (!target.parameters) target.parameters = [];
  
  target.parameters.unshift({
    param, key
  });
}
