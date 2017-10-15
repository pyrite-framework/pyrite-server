export function Request(parameter: string): any;
export function Request(target: any, method: string, descriptor: any): any;
export function Request(target: any, method?: string): any {
	return setParametersType("request", target, method);
}

export function Response(parameter: string): any;
export function Response(target: any, method: string, descriptor: any): any;
export function Response(target: any, method?: string): any {
	return setParametersType("response", target, method);
}

export function Headers(parameter: string): any;
export function Headers(target: any, method: string, descriptor: any): any;
export function Headers(target: any, method?: string): any {
	return setParametersType("headers", target, method);
}

export function Cookies(parameter: string): any;
export function Cookies(target: any, method: string, descriptor: any): any;
export function Cookies(target: any, method?: string): any {
	return setParametersType("cookies", target, method);
}

export function Session(parameter: string): any;
export function Session(target: any, method: string, descriptor: any): any;
export function Session(target: any, method?: string): any {
	return setParametersType("session", target, method);
}

export function Body(parameter: string): any;
export function Body(target: any, method: string, descriptor: any): any;
export function Body(target: any, method?: string): any {
	return setParametersType("body", target, method);
}

export function Query(parameter: string): any;
export function Query(target: any, method: string, descriptor: any): any;
export function Query(target: any, method?: string): any {
	return setParametersType("query", target, method);
}

export function Params(parameter: string): any;
export function Params(target: any, method: string, descriptor: any): any;
export function Params(target: any, method?: string): any {
	return setParametersType("params", target, method);
}

function setParametersType(type: string, targetDefault: any, method?: string, key?: string): any {
	if (!method) return (target: any, method: string): any => {
		return setParametersType(type, target, method, targetDefault);
	}

	return setParameters(targetDefault[method], type, key);
}

function setParameters(target: any, param: string, key?: string): any {
	if (!target.parameters) target.parameters = [];

	target.parameters.unshift({
		param, key
	});
}
