import { Server } from './server';

function Route (path): Function {
	return function(target, method, descriptor): void {
		target.prototype.rootPath = path;
	}
}

function Get (path, type?): Function {
	return function(target, method, descriptor): void {
		setTimeout(() => {
			console.log('Loading: GET ' + target.rootPath + path);

			Server.app.get(target.rootPath + path, function (req, res) {
				const parameters = getOrder(target[method].parameters, req);
				
				console.log(method + ' GET ' + target.rootPath + path);

				const result = target[method](...parameters);
				res.send(result);
			});
		});
	}
}

function Post (path): Function {
	return function(target, method, descriptor): void {
		setTimeout(() => {
			console.log('Loading: POST ' + target.rootPath + path);

			Server.app.post(target.rootPath + path, function (req, res) {
				const parameters = getOrder(target[method].parameters, req);
				
				console.log(method + ' POST ' + target.rootPath + path);

				const result = target[method](...parameters);
			  	res.send(result);
			});
		});
	}
}

function getOrder(parameters, request) {
	if (!parameters) return [];
	return parameters.map((params) => request[params]);
}

function Query (target, method, descriptor): void {
	if (!target[method].parameters) target[method].parameters = [];
	
	target[method].parameters.push('query');
}

function Params (target, method, descriptor): void {
	if (!target[method].parameters) target[method].parameters = [];
	
	target[method].parameters.push('params');
}

function Body (target, method, descriptor): void {
	if (!target[method].parameters) target[method].parameters = [];
	
	target[method].parameters.push('body');
}


export {Route, Get, Post, Body, Query, Params};