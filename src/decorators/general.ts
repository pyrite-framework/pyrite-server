import * as I from "../interfaces";

export function Alias(name: string): Function {
	return function(target: any, method: string, descriptor: PropertyDescriptor): void {
		target[method].alias = name;
	};
}

export function Status(status: number): Function {
	return function(target: any, method: string, descriptor: PropertyDescriptor): void {
		target[method].status = status;
	};
}

export function Before(middleware: I.Middleware): Function {
	return function(target: any, method: string, descriptor: PropertyDescriptor): void {
		let befores = [];

		if (!method) {
			if (!target.prototype.beforeAll) befores = target.prototype.beforeAll = [];
			target.prototype.beforeAll.unshift(middleware);
			return target;
		}

		if (method && !target[method].before) {
			target[method].before = [];
		}

		target[method].before.unshift(middleware);
	};
}

export function After(middleware: Function): Function {
	return function(target: any, method: string, descriptor: PropertyDescriptor): void {
		if (!target[method].after) target[method].after = [];

		target[method].after.unshift(middleware);
	};
}

export function Exception(status: number, error: any): { status: number, error: any } {
	return {
		status: status || 500,
		error
	};
}

