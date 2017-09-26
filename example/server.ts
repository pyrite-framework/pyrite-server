import { Server } from "../src";

const server: Server = new Server({
  port: 8000,
  routes: __dirname + "/routes"
});

server.listen(() => {
  console.log("Server running!");
});
