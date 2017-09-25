import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as logger from 'morgan';
import * as path from 'path';
import * as fs from 'fs';

export class Server {
  static app: express.Application;
  port: number;
  routesPath: string;

  constructor(params: { port: number, routes: string }) {
    Server.app = express();
    Server.app.use(bodyParser.json());

    this.port = params.port;
    this.routesPath = params.routes;
  }

  loadRoutes(): void {
    fs.readdirSync(__dirname + this.routesPath).forEach((file) => {
      require(__dirname + this.routesPath + '/' + file);
    });
  }

  listen(cb: Function): void {
    this.loadRoutes();

    setTimeout(() => {
      Server.app.listen(this.port, cb.bind({}, this.port));
    });
  }
}

const server: Server = new Server({
  port: 8080,
  routes: '/routes'
});

server.listen((port) => {
  console.log(`Example app listening on port ${port}!`);
});
