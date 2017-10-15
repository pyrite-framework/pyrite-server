export interface ServerConfig {
	(app: Express.Application): void;
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
