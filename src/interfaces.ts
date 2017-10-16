import { Application } from "express";

export interface ServerConfig {
	(app: Application): void;
};

export interface ServerParams {
	port: number;
	routes: any;
	cors?: Array<string>;
	config?: ServerConfig;
	plugins?: Array<any>;
};

export interface Middleware {
	(req: any, res: any, next: Function): void;
};

export interface Parameter {
	param: string;
	key?: string;
};

export interface RouteConfig {
	methodName: string;
	path: string|null;
	types: Array<any>;
	action: string;
};

export interface Exception {
	error: any;
	status: number;
};

export interface Method {
	(parameters?: Array<any>): any;
	before: Array<Middleware>;
	after: Array<Function>;
	parameters: Array<Parameter>;
	validations: Array<any>;
	status: number;
	path: string;
	alias: string;
	name: string;
}

