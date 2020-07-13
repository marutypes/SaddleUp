import {Server} from 'http';

import {Request, Response} from 'node-fetch';

export interface Options {
  host: string;
  port: number;
  cookies: Record<string, string>;
}

export interface Listenable {
  listen(port?: number, host?: string): Server;
}

export interface Adapter<FetchResult = Response> {
  fetchResult: (request: Request, response: Response) => FetchResult;
}
