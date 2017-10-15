import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as fs from "fs";
import * as path from "path";
import * as cors from "cors";

import { Route } from "./route";
import * as I from "./interfaces";

export class Server {
	app: express.Application;
	controllersAllowed: any = {};
	plugins: Array<any> = [];

	constructor(private params: I.ServerParams) {
		if (params.plugins) this.plugins = params.plugins;
		if (params.config) this.config(params.config);
	}

	private loadExpress(): void {
		this.app = express();
		this.app.use(bodyParser.json());
		this.app.use(this.bodyParserError);
		this.app.use(cookieParser());

		if (this.params.cors) {
			this.app.use(cors({
				origin: this.params.cors
			}));
		}
	}

	private bodyParserError(error: any, req: any, res: any, next: Function) {
		if (!(error instanceof SyntaxError)) next();

		res.status(400).send({
			error: {
				message: "invalid json",
				exception: error.message
			}
		});
	}

	private loadRoutes(): void {
		if (!Array.isArray(this.params.routes)) this.params.routes = [this.params.routes];

		this.params.routes.forEach((route: string) => {
			this.loadRoute(route);
		});
	}

	private loadRoute(route: string): void {
		const rootPath = require.main ? require.main.filename : ".";

		const folder: string = path.dirname(rootPath) + route;

		fs.readdirSync(folder).forEach((file: string) => {
			if (file.indexOf(".js.map") >= 0) return;
			const controller = require(`${folder}/${file}`);

			const instance = new controller[Object.keys(controller)[0]]();

			if (!instance.routes) return;

			this.controllersAllowed[instance.alias] = {};

			instance.routes.forEach((method: any) => {
				const routeInstance = new Route(this, instance, method.method, method.path, method.types, method.action);
				this.addRouteMiddleware(routeInstance);
				this.loadMiddlewareEmitter(routeInstance);
			})
		});
	}

	private loadMiddlewareEmitter(route: Route): void {
		const emitter = this.plugins.find((plugin: any) => plugin.type === "emitter");
		if (emitter) route.emitCallback = emitter.loadEmit(route.target, route.method);
	}

	private addRouteMiddleware(route: Route) {
		this.controllersAllowed[route.target.alias][route.targetMethod.alias] = {
			url: route.target.path + (route.targetMethod.path),
			action: route.action.toUpperCase(),
			validations: route.targetMethod.validations
		};

		(<any>this.app)[route.action](route.target.path + route.targetMethod.path, ...route.befores);
	}

	private loadEmitters(server: any): void {
		const emitter = this.plugins.find((plugin: any) => plugin.type === "emitter");

		if (emitter) emitter.run(Server, server);
	}

	private configCallback(): void { }

	public config(callbackConfig: I.ServerConfig) {
		this.configCallback = callbackConfig.bind(this, this.app);
		return this;
	}

	public listen(callbackListen: Function): void {
		this.loadExpress();
		this.loadRoutes();
		this.configCallback();

		const server = this.app.listen(this.params.port, () => {
			this.loadEmitters(server);
			callbackListen();
		});
	}
}
