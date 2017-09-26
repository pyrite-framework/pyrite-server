import { Server } from '../src';

const server: Server = new Server({
  port: 8080,
  routes: __dirname + '/routes'
});

server.listen((port) => {
  console.log(`Server listening on port ${port}!`);
});
