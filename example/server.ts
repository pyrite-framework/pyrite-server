import "source-map-support/register";

import { Server } from "../src";

const server: Server = new Server({
  port: 8000,
  routes: "/routes"
});

server.listen(() => {
  console.log("Server running!");
});
