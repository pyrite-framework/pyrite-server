import { Route, Get, Post, Put, Delete, Body, Params, Query, Exception } from "../../src";

interface UserModel {
  id: number;
  name: string;
  lastname: string;
}

const users: Array<UserModel> = [];

let index = 0;

@Route("/users")
class Users {
  @Get("/")
  getUsers(@Query("name") name): Array<UserModel> {
    return users.filter((user) => !name || user.name === name);
  }

  @Post("/")
  createUser(@Body user: UserModel): UserModel {
    user.id = index++;

    users.push(user);
    
    return user;
  }

  @Get("/:id", Number)
  getUser(@Params("id") id): UserModel {
    const user = users.find((user) => user.id === id);
    if (!user) throw Exception(404, "not_found");
    
    return user;
  }

  @Put("/:id", Number)
  updateUser(@Params("id") id, @Body user: UserModel): UserModel {
    const foundUser = users.find((user) => user.id === id);
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