import { serverInstances } from "../server";

export function Route(path?: any, alias?: string): any {
	const server = serverInstances[0];

	if (typeof path === "function") {
		path.prototype.path = "/" + path.name;
		path.prototype.alias = path.name;

		server.controllersAllowed[path.prototype.alias] = {};

		return path;
	}

	return function(target: any, method: string, descriptor: PropertyDescriptor): void {
		target.prototype.path = alias ? '/' + alias : path;
		target.prototype.alias = alias || target.name;

		server.controllersAllowed[target.prototype.alias] = {};
	}
};

export function Get(path?: any, ...types: Array<any>): void {
	handler("get", path, types);
}

export function Post(path?: any, ...types: Array<any>): void {
	handler("post", path, types);
}

export function Put(path?: any, ...types: Array<any>): void {
	handler("put", path, types);
}

export function Delete(path?: any, ...types: Array<any>): void {
	handler("delete", path, types);
}

export function Head(path?: any, ...types: Array<any>): void {
	handler("head", path, types);
}

function handler(action: string, path: any, types: Array<any>): number | Function {
	const server = serverInstances[0];

	if (typeof path === "object") {
		return setTimeout(() => server.createRoute(path, types[0], null, [], action));
	}

	return function(target: any, method: string, descriptor: PropertyDescriptor): void {
		setTimeout(() => server.createRoute(target, method, path, types, action));
	}
}
