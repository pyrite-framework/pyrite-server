import * as I from "../interfaces";

export function Route(path?: any, alias?: string): any {
	if (typeof path === "string") {
		return function(target: any, method: string, descriptor: PropertyDescriptor): void {
			target.prototype.path = alias ? `/${alias}` : path;
			target.prototype.alias = alias || target.name;
		}
	}

	path.prototype.path = `/${path.name}`;
	path.prototype.alias = path.name;
}

export function Storage(headerKey: any, storageKey?: string): any {
	return function(target: any, method: string, descriptor: PropertyDescriptor): void {
		const storage = {
			remote: headerKey,
			local: storageKey || headerKey
		};

		if (!method) {
			if (!target.prototype.storage) target.prototype.storage = [];
			target.prototype.storage.push(storage);

			return target;
		}

		if (!target[method].storage) target[method].storage = [];

		target[method].storage.push(storage);
	}
}

export function Alias(name: string): Function {
	return function(target: any, method: string, descriptor: PropertyDescriptor): void {
		target[method].alias = name;
	}
}

export function Status(status: number): Function {
	return function(target: any, method: string, descriptor: PropertyDescriptor): void {
		target[method].status = status;
	}
}

export function Before(middleware: I.Middleware): Function {
	return function(target: any, method: string, descriptor: PropertyDescriptor): void {
		if (!method) {
			if (!target.prototype.beforeAll) target.prototype.beforeAll = [];
			target.prototype.beforeAll.unshift(middleware);
			return target;
		}

		if (method && !target[method].before) {
			target[method].before = [];
		}

		target[method].before.unshift(middleware);
	}
}

export function After(middleware: Function): Function {
	return function(target: any, method: string, descriptor: PropertyDescriptor): void {
		if (!target[method].after) target[method].after = [];

		target[method].after.unshift(middleware);
	};
}

export function Exception(status: number, error: any): I.Exception {
	return {
		status: status || 500,
		error
	}
}

