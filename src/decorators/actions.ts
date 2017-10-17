import * as I from "../interfaces";

export function Get(path: any, ...types: Array<any>): any {
	return handler("get", path, types);
}

export function Post(path: any, ...types: Array<any>): any {
	return handler("post", path, types);
}

export function Put(path: any, ...types: Array<any>): any {
	return handler("put", path, types);
}

export function Delete(path: any, ...types: Array<any>): any {
	return handler("delete", path, types);
}

export function Head(path: any, ...types: Array<any>): any {
	return handler("head", path, types);
}

function handler(action: string, path: any, types: Array<any>): any {
	if (typeof path === "string") {
		return function(target: any, method: string, descriptor: PropertyDescriptor): void {
			addRoute(target, method, action, types, path);
		}
	}

	addRoute(path, types[0], action);
}

function addRoute(target: any, methodName: string, action: string, types: Array<any> = [], path: string|null = null): any {
	if (!target.routes) target.routes = [];

	const params: I.RouteConfig = {
		methodName,
		path,
		types,
		action
	};

	target.routes.push(params);

	return target;
}

