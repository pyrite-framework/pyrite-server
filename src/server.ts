import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as fs from "fs";
import * as path from "path";
import * as cors from "cors";

import { Route } from "./route";
import * as I from "./interfaces";

export class Server {
	private app: express.Application;
	private controllersAllowed: any = {};
	private plugins: Array<any> = [];

	constructor(private params: I.ServerParams) {
		if (params.plugins) this.plugins = params.plugins;
		if (params.config) this.config(params.config);
	}

	private loadExpress(): void {
		this.app = express();

		this.app.use(bodyParser.urlencoded({ extended: true }));
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

	private loadRouteFolders(): void {
		if (!Array.isArray(this.params.routes)) this.params.routes = [this.params.routes];

		this.params.routes.forEach((route: string) => {
			this.loadRouteFile(route);
		});
	}

	private loadRouteFile(routeFolder: string): void {
		const rootPath = require.main ? require.main.filename : ".";

		const folder: string = path.dirname(rootPath) + routeFolder;

		fs.readdirSync(folder).forEach((file: string) => {
			if (file.indexOf(".js") < 0) return;
			if (file.indexOf(".js.map") >= 0) return;
			const route = require(`${folder}/${file}`);

			this.loadRoute(route);
		});
	}

	private loadRoute(route: any) {
		const routeControllers = Object.keys(route);

		routeControllers.forEach((routeKey) => {
			const routeController = route[routeKey];

			if (!routeController.prototype.routes) return;

			const instance = new routeController();

			this.controllersAllowed[instance.alias] = {};

			instance.routes.forEach((method: I.RouteConfig) => {
				const routeInstance = new Route(this, instance, method);

				this.addRouteMiddleware(routeInstance);
				this.loadMiddlewareEmitter(routeInstance);
			});
		});
	}

	private loadMiddlewareEmitter(route: Route): void {
		const emitter = this.plugins.find((plugin: any) => plugin.type === "emitter");
		if (emitter) route.emitCallback = emitter.loadEmit(route.target, route.method);
	}

	private addRouteMiddleware(route: Route) {
		this.controllersAllowed[route.target.alias][route.targetMethod.alias] = {
			url: route.target.path + (route.targetMethod.path),
			action: route.method.action.toUpperCase(),
			validations: route.targetMethod.validations
		};

		const url = route.target.path + route.targetMethod.path;

		(<any>this.app)[route.method.action](url, ...route.befores);
	}

	private loadEmitters(server: any): void {
		const emitter = this.plugins.find((plugin: any) => plugin.type === "emitter");

		if (emitter) emitter.run(Server, server);
	}

	private configCallback(): void {}

	public config(callbackConfig: I.ServerConfig) {
		this.configCallback = callbackConfig.bind(this, this.app);
		return this;
	}

	public listen(callbackListen: Function): void {
		this.loadExpress();
		this.loadRouteFolders();
		this.configCallback();

		const server = this.app.listen(this.params.port, () => {
			this.loadEmitters(server);
			callbackListen();
		});
	}
}
