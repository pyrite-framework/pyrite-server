import { Application, Request, Response } from "express";
import { Route } from "./route";

export interface ServerConfig {
	(app: Application): void;
}

export interface ServerParams {
	port: number;
	routes: any;
	cors?: Array<string>;
	config?: ServerConfig;
	plugins?: Array<any>;
}

export interface Middleware {
	(request: Request, response: Response, next?: (error?: any) => void): void;
}

export interface Parameter {
	param: string;
	key?: string;
}

export interface RouteConfig {
	methodName: string;
	path: string|null;
	types: Array<any>;
	action: string;
}

export interface Exception {
	error: any;
	status: number;
}

export interface Method {
	(parameters?: Array<any>): any;
	before: Array<Middleware>;
	after: Array<Function>;
	parameters: Array<Parameter>;
	status: number;
	path: string;
	alias: string;
	name: string;
}

export interface Plugin {
	run(server: any): void;
	run(request: Request, response: Response, route: Route): boolean;
	load(target: any, method: RouteConfig): Function;
	add(configParam: ConfigParam, route: Route): void;
	name: string;
	type: string;
	param: string;
}

export interface ConfigParam {
	url: string;
	action: string;
}
