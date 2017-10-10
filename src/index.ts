import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as fs from "fs";
import * as path from "path";

import { Emiter } from "./emiter.js";

export {
  Get, Post, Put, Delete, Head
} from  "./decorators/actions";

export {
  Alias, Route, Status, Before, After, Emits, Broadcast, Exception
} from "./decorators/general";

export {
  Request, Response, Headers, Cookies, Session, Query, Params, Body, Emit
} from "./decorators/parameters";

export interface ServerConfig {
  (app: express.Application): void;
};

export interface ServerParams {
  port: number;
  routes: any;
  config?: ServerConfig;
};

export class Server {
  static app: express.Application;
  private emiter: Emiter;
  static controllersAllowed: any = {};

  constructor(private params: ServerParams) {
    Server.app = express();
    Server.app.use(bodyParser.json());
    Server.app.use(cookieParser());

    if (params.config) this.config(params.config);
  }

  private loadRoutes(): void {
    if (!Array.isArray(this.params.routes)) this.params.routes = [this.params.routes];

    this.params.routes.forEach((route: string) => {
      this.loadRoute(route);
    });    
  }

  private loadRoute(route: string): void {
    const folder: string = path.dirname(require.main.filename) + route;

    fs.readdirSync(folder).forEach((file: string) => {
      if (file.indexOf('.js.map') >= 0) return;
      require(`${folder}/${file}`);
    });
  }

  private loadEmiters(server: any): void {
    this.emiter = new Emiter(server);
  }

  private configCallback(): void {}

  public config(callbackConfig: ServerConfig) {
    this.configCallback = callbackConfig.bind(this, Server.app);
    return this;
  }

  public listen(callbackListen: Function): void {
    this.loadRoutes();
    this.configCallback();

    setTimeout(() => {
      const server: any = Server.app.listen(this.params.port, callbackListen);
      this.loadEmiters(server);
    });
  }
}
