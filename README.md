# pyrite-server

## Install

- Decorators feature has to be enabled.

```
npm install pyrite-server
```

## Example

### main.js

```typescript
import { Server } from "pyrite-server";

const server = new Server({
  port: 8000,
  routes: "/routes"
});

server.listen(() => {
  console.log("Server running!");
});
```

### /routes folder:
  ### users.js
  
```typescript
import { 
  Route, Get, Post, Put, Delete, Exception, Body, Params, Query
} from "pyrite-server";

const users = [];
let index = 0;

@Route("/users")
class Users {
  @Get("/")
  getUsers(@Query("name") name) {
    const result = users.filter((user) => !name || user.name === name);
    
    return result;
  }

  @Post("/")
  createUser(@Body user) {
    user.id = index++;

    users.push(user);
    
    return user;
  }

  @Get("/:id", Number)
  getUser(@Params("id") id) {
    const user = users.find((user) => user.id === id);
    if (!user) throw Exception(404, "not_found");
    
    return user;
  }

  @Put("/:id", Number)
  @Broadcast
  updateUser(@Body user) {
    const foundUser = users.find((localUser) => localUser.id === user.id);
    if (!user) throw Exception(404, "not_found");

    Object.assign(foundUser, user);

    return user;
  }

  @Delete("/:id", Number)
  removeUser(@Params("id") id) {
    const indexUser = users.findIndex((user) => user.id === id);
    if (indexUser === -1) throw Exception(404, "not_found");

    users.splice(indexUser, 1);

    return true;
  }
}
```
