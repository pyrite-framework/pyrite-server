import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as fs from "fs";
import * as path from "path";
import * as cors from "cors";

import { Route } from "./route";
import { Plugins } from "./plugins";

import * as I from "./interfaces";

export class PyriteServer {
	private app: express.Application;
	private controllersAllowed: any = {};
	private plugins: Plugins|void;
	private connection: any;

	constructor(private params: I.ServerParams) {
		if (params.plugins) this.plugins = new Plugins(this, params.plugins);
		if (params.config) this.config(params.config);

		this.loadExpress();
		this.loadRouteFolders();
		this.loadConnect();
		this.configCallback();
	}

	private loadExpress(): void {
		this.app = express();

		this.app.use(bodyParser.urlencoded({ extended: true }));
		this.app.use(bodyParser.json());
		this.app.use(this.bodyParserError);
		this.app.use(cookieParser());

		if (this.params.cors) this.app.use(cors({ origin: this.params.cors }));
	}

	private configCallback(): void {}

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

	private loadRoute(route: any): void {
		const routeControllers = Object.keys(route);

		routeControllers.forEach((routeKey: string) => {
			const routeController = route[routeKey];

			if (!routeController.prototype.routes) return;

			const instance = new routeController();

			this.controllersAllowed[instance.alias] = {};

			instance.routes.forEach((method: I.RouteConfig) => {
				const routeInstance = new Route(this, instance, method);

				this.addRouteMiddleware(routeInstance);
				if (this.plugins) this.plugins.load(routeInstance);
			});
		});
	}

	private loadConnect(): void {
		this.app.get("/", (req: express.Request, res: express.Response) => {
			res.send(this.controllersAllowed);
		});
	}

	private addRouteMiddleware(route: Route): void {
		const configParam: any = this.controllersAllowed[route.target.alias][route.targetMethod.alias] = {
			url: route.target.path + (route.targetMethod.path),
			action: route.method.action.toUpperCase(),
			params: route.targetMethod.parameters
		};

		this.setStorage(route, configParam);

		if (this.plugins) {
			const plugins = this.plugins.getByType("middleware");

			plugins.forEach((plugin: I.Plugin) => {
				if (plugin.add) plugin.add(configParam, route);
			});
		}

		const url = route.target.path + route.targetMethod.path;

		(<any>this.app)[route.method.action](url, ...route.befores);
	}

	private setStorage(route: Route, configParam: any) {
		if (route.target.storage || route.targetMethod.storage) configParam.storage = [];
		if (route.target.storage) configParam.storage = configParam.storage.concat(route.target.storage);
		if (route.targetMethod.storage) configParam.storage = configParam.storage.concat(route.targetMethod.storage);
	}

	public config(callbackConfig: I.ServerConfig): PyriteServer {
		this.configCallback = callbackConfig.bind(this, this.app);
		return this;
	}

	public listen(callbackListen: Function): void {
		this.connection = this.app.listen(this.params.port, () => {
			if (this.plugins) this.plugins.run();
			callbackListen();
		});
	}
}
