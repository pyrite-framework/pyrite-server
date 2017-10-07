import { Route, Get, Post, Put, Delete, Body, Params, Query, Exception, Emits, Emit, Broadcast } from "../../src";

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
  getUsers(@Query("name") name: string): Promise<UserModel[]> {
    const result = users.filter((user) => !name || user.name == name);
    
    return Promise.resolve(result);
  }

  @Post("/")
  @Broadcast
  createUser(@Body user: UserModel, @Emit emit: Function): UserModel {
    user.id = index++;

    users.push(user);

    emit(user);
    
    return user;
  }

  @Get("/:id", Number)
  getUser(@Params("id") id: number): UserModel {
    const user = users.find((user) => user.id == id);
    if (!user) throw Exception(404, "not_found");
    
    return user;
  }

  @Put("/:id", Number)
  @Broadcast
  updateUser(@Body user: UserModel, @Emit emit: Function): UserModel {
    const foundUser = users.find((localUser) => localUser.id == user.id);
    if (!user) throw Exception(404, "not_found");

    Object.assign(foundUser, user);

    emit(user);

    return user;
  }

  @Delete("/:id", Number)
  @Emits
  removeUser(@Params("id") id: number, @Emit emit: Function): Boolean {
    const indexUser = users.findIndex((user) => user.id == id);
    if (indexUser === -1) throw Exception(404, "not_found");

    users.splice(indexUser, 1);

    emit(id);

    return true;
  }
}