import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as fs from "fs";

import * as Actions from "./decorators/actions";
import * as General from "./decorators/general";
import * as Parameters from "./decorators/parameters";

interface ServerConfig {
  (app: express.Application): void;
};

interface ServerParams {
  port: number;
  routes: string;
  config?: ServerConfig;
};

export class Server {
  static app: express.Application;

  constructor(private params: ServerParams) {
    Server.app = express();
    Server.app.use(bodyParser.json());
    Server.app.use(cookieParser());

    if (params.config) this.config(params.config);
  }

  private loadRoutes(): void {
    fs.readdirSync(this.params.routes).forEach((file) => {
      require(`${this.params.routes}/${file}`);
    });
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
      Server.app.listen(this.params.port, callbackListen);
    });
  }
}

export const Get = Actions.Get;
export const Post = Actions.Post;
export const Put = Actions.Put;
export const Delete = Actions.Delete;
export const Head = Actions.Head;

export const Route = General.Route;
export const Status = General.Status;
export const Exception = General.Exception;
export const Before = General.Before;
export const After = General.After;

export const Headers = Parameters.Headers;
export const Cookies = Parameters.Cookies;
export const Session = Parameters.Session;
export const Query = Parameters.Query;
export const Params = Parameters.Params;
export const Body = Parameters.Body;
