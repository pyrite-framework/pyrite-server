import * as I from "./interfaces";

export class Route {
	emitCallback: Function;
	targetMethod: I.Method;
	befores: Array<I.Middleware>;

	constructor(
		public server: any,
		public target: any,
		public method: string,
		public path: string,
		public types: Array<any>,
		public action: string
	) {
		this.targetMethod = target[method];
		this.targetMethod.path = path || "/" + this.targetMethod.name;
		this.targetMethod.alias = this.targetMethod.alias || this.targetMethod.name;

		console.log(`Loading route: ${action.toUpperCase()} ${this.target.path}${this.targetMethod.path}`);

		this.befores = this.addBeforeMiddlewares();

		this.befores.push(this.mainMiddleware.bind(this));
	}

	private loadMiddlewarePlugins(req: any, res: any): Boolean {
		return this.server.plugins
			.filter((plugin: any) => plugin.type === "middleware")
			.some((plugin: any): any => plugin.run(req, res, this.target, this.method));
	}

	private addBeforeMiddlewares(): Array<I.Middleware> {
		let befores: Array<I.Middleware> = [];

		if (this.targetMethod && this.targetMethod.before) befores = befores.concat(this.targetMethod.before);
		if (this.target.beforeAll) befores = this.target.beforeAll.concat(befores);

		return befores;
	}

	private addAfterMiddlewares(result: any): any {
		if (!this.targetMethod.after) return result;

		return this.targetMethod.after.reduce((prev: Function, next: Function) => next(prev), result);
	}

	private mainMiddleware(req: any, res: any): void {
		const failSome = this.loadMiddlewarePlugins(req, res);
		if (failSome) return;

		let parameters: Array<any> = this.getOrder(req, res);

		console.log(`${this.action.toUpperCase()} ${this.target.path + this.targetMethod.path}`);

		let result = this.targetMethod(...parameters);

		result = this.addAfterMiddlewares(result);

		if (!result || typeof result.then !== "function") result = Promise.resolve(result);

		result.then((methodResult: any) => {
			if (methodResult.error && methodResult.status) return res.status(methodResult.status).send({ error: methodResult.error });
			res.status(this.targetMethod.status || 200).send(methodResult);
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

	private getOrder(request: any, response: any): Array<any> {
		const parameters = this.targetMethod.parameters;
		const path = this.targetMethod.path;

		if (!parameters) return [request, response];
		if (this.types.length) this.setTypes(path, this.types, request.params);

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
