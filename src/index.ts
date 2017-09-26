import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as fs from 'fs';

export class Server {
  static app: express.Application;
  port: number;
  routesPath: string;
  __config: Function;

  constructor(params: { port: number, routes: string, config?: Function }) {
    Server.app = express();
    Server.app.use(bodyParser.json());
    Server.app.use(cookieParser());

    this.port = params.port;
    this.routesPath = params.routes;
    if (params.config) this.config(params.config)
  }

  __loadRoutes(): void {
    fs.readdirSync(this.routesPath).forEach((file) => {
      require(this.routesPath + '/' + file);
    });
  }

  config(cb) {
    this.__config = cb.bind(this, Server.app);
    return this;
  }

  listen(cb: Function): void {
    this.__loadRoutes();
    if (this.__config) this.__config();

    setTimeout(() => {
      Server.app.listen(this.port, cb.bind({}, this.port));
    });
  }
}
