import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as fs from "fs";
import * as path from "path";
import * as cors from "cors";

import { Route } from "./route";
import * as I from "./interfaces";

export const serverInstances: Array<Server> = [];

export class Server {
	app: express.Application;
	controllersAllowed: any = {};
	plugins: Array<any> = [];

	constructor(private params: I.ServerParams) {
		if (params.plugins) this.plugins = params.plugins;
		if (params.config) this.config(params.config);

		serverInstances.unshift(this);
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

			new controller[Object.keys(controller)[0]]();
		});
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

	createRoute(target: any, method: string, path: any, types: Array<any>, action: string): void {
		new Route(this, target, method, path, types, action);
	}
}
