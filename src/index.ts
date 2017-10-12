import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as fs from "fs";
import * as path from "path";
import * as cors from "cors";

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
  cors?: Array<string>;
  config?: ServerConfig;
  plugins?: Array<any>;
};

function bodyParserError(error, req, res, next) {
  if (!(error instanceof SyntaxError)) next();

  res.status(400).send({
    error: {
      message: 'invalid json',
      exception: error.message
    }
  });
}

export class Server {
  static app: express.Application;
  private emiter: Emiter;
  static controllersAllowed: any = {};
  static plugins: Array<any> = [];

  constructor(private params: ServerParams) {
    Server.app = express();
    Server.app.use(bodyParser.json());
    Server.app.use(bodyParserError);
    Server.app.use(cookieParser());

    if (params.cors) {
      Server.app.use(cors({
        origin: params.cors
      }));
    }

    if (params.plugins) Server.plugins = params.plugins;

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

    const server = Server.app.listen(this.params.port, () => {
      this.loadEmiters(server);
      callbackListen();
    });
  }
}
