import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as fs from "fs";
import * as path from "path";

import { Emiter } from "./emiter.js";
import * as Actions from "./decorators/actions";
import * as General from "./decorators/general";
import * as Parameters from "./decorators/parameters";

interface ServerConfig {
  (app: express.Application): void;
};

interface ServerParams {
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

export function Exception (status: number, result: any): { status: number, result: any } {
  return {
    status, result
  };
}

export const Get = Actions.Get;
export const Post = Actions.Post;
export const Put = Actions.Put;
export const Delete = Actions.Delete;
export const Head = Actions.Head;

export const Alias = General.Alias;
export const Route = General.Route;
export const Status = General.Status;
export const Before = General.Before;
export const After = General.After;
export const Emits = General.Emits;
export const Broadcast = General.Broadcast;

export const Request = Parameters.Request;
export const Response = Parameters.Response;
export const Headers = Parameters.Headers;
export const Cookies = Parameters.Cookies;
export const Session = Parameters.Session;
export const Query = Parameters.Query;
export const Params = Parameters.Params;
export const Body = Parameters.Body;
export const Emit = Parameters.Emit;
