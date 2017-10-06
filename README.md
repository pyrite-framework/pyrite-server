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
  Route, Get, Post, Put, Delete, Exception, Body, Params, Query, Emits, Emit, Broadcast
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
  @Broadcast
  createUser(@Body user, @Emit emit) {
    user.id = index++;

    users.push(user);

    emit(user);
    
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
  updateUser(@Body user, @Emit emit) {
    const foundUser = users.find((localUser) => localUser.id === user.id);
    if (!user) throw Exception(404, "not_found");

    Object.assign(foundUser, user);

    emit(user);

    return user;
  }

  @Delete("/:id", Number)
  @Emits
  removeUser(@Params("id") id, @Emit emit) {
    const indexUser = users.findIndex((user) => user.id === id);
    if (indexUser === -1) throw Exception(404, "not_found");

    users.splice(indexUser, 1);

    emit(id);

    return true;
  }
}
```

## Develop new contributions

```sh
sudo npm install -g nodemon
npm install

npm run watch
npm start #in another terminal
```

