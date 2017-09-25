import {Route, Get, Post, Body, Params, Query } from '../decorators';

interface User {
	id: number
	name: string,
	lastname: string
}

const users: Array<User> = [];
let index = 0;

@Route('/users')
class Users {
	@Get('/')
	getUsers(@Query query): Array<User> {
		return users.filter((user) => !query.name || user.name === query.name);
	}

	@Get('/:id', Number)
	getUser(@Params params): User {
		return users.find((user) => user.id == params.id);
	}

	@Post('/')
	createUser(@Body body): Boolean {
		body.id = index++;

		users.push(body);
		return true;
	}
}