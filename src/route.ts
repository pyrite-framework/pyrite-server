import * as I from "./interfaces";

export class Route {
	emitCallback: Function;

	constructor(private server: any, target: any, method: string, path: any, types: Array<any>, action: string) {
		target[method].path = path || "/" + target[method].name;
		console.log(`Loading route: ${action.toUpperCase()} ${target.path}${target[method].path}`);

		let befores: Array<I.Middleware> = [];

		if (target[method] && target[method].before) befores = befores.concat(target[method].before);
		if (target.beforeAll) befores = target.beforeAll.concat(befores);

		befores.push(this.middleware.bind(this, target, method, action, types));

		target[method].alias = target[method].alias || target[method].name;

		this.server.controllersAllowed[target.alias][target[method].alias] = {
			url: target.path + (target[method].path),
			action: action.toUpperCase(),
			validations: target[method].validations
		};

		(<any>this.server.app)[action](target.path + target[method].path, ...befores);

		this.loadMiddlewareEmitter(target, method);
	}

	private loadMiddlewareEmitter(target: any, method: string): void {
		const emitter =  this.server.plugins.find((plugin: any) => plugin.type === "emitter");
		if (emitter) this.emitCallback = emitter.loadEmit(target, method);
	}

	private loadMiddlewarePlugins(target: any, method: string, req: any, res: any): Boolean {
		return this.server.plugins
			.filter((plugin: any) => plugin.type === "middleware")
			.some((plugin: any): any => plugin.run(req, res, target, method));
	}

	private middleware(target: any, method: any, action: string, types: Array<any>, req: any, res: any): void {
		const failSome = this.loadMiddlewarePlugins(target, method, req, res);
		if (failSome) return;

		let parameters: Array<any> = this.getOrder(target[method], types, req, res);

		console.log(`${action.toUpperCase()} ${target.path + target[method].path}`);

		let result = target[method](...parameters);

		if (target[method].after) {
			result = target[method].after.reduce((prev: Function, next: Function) => next(prev), result);
		}

		if (!result || typeof result.then !== "function") result = Promise.resolve(result);

		result.then((methodResult: any) => {
			if (methodResult.error && methodResult.status) return res.status(methodResult.status).send({ error: methodResult.error });
			res.status(target[method].status || 200).send(methodResult);
		})
		.catch((error: any) => {
			console.log(error);
			res.status(500).send(error);
		});
	}

	private setTypes(path: string, types: Array<any>, parameters: any): Array<any> {
		const routes = path.split("/");

		let paramNumber = 0;

		routes.forEach((route: string) => {
			if (route[0] === ":") {
				const key = route.substring(1, route.length);
				parameters[key] = types[paramNumber](parameters[key]);
				paramNumber++;
			}
		});

		return parameters;
	}

	private getOrder(target: any, types: Array<any>, request: any, response: any): Array<any> {
		const parameters = target.parameters;
		const path = target.path;

		if (!parameters) return [request, response];
		if (types.length) this.setTypes(path, types, request.params);

		return parameters.map((parameter: I.Parameter): any => {
			if (parameter.param === "request") return this.getDescendantProp(request, parameter.key);
			else if (parameter.param === "response") return this.getDescendantProp(response, parameter.key);
			else if (parameter.param === "emit") return this.emitCallback.bind(this, request.headers["pyrite-token"], request.headers["pyrite-id"]);
			else if (parameter.key) return this.getDescendantProp((<any>request)[parameter.param], parameter.key);

			return (<any>request)[parameter.param];
		});
	}

	private getDescendantProp(obj: any, desc: string | void): any {
		if (!desc) return obj;

		const arr = desc.split(".");

		while (arr.length && (obj = obj[arr.shift() || '']));

		return obj;
	}
}
