import {Server} from 'http';

import {Request, Response} from 'node-fetch';

export interface Options {
  host: string;
  port: number;
  cookies: Record<string, string>;
}

export type Listenable = ListenableFactory | ListenableObject;

export interface ListenableFactory {
  (port: number, host: string): ListenableObject;
}

export interface ListenableObject {
  listen(port?: number, host?: string): Server;
}

export interface Adapter<AppInput, FetchResult, Opts = Options> {
  decorate(
    app: AppInput,
    options?: Partial<Opts>,
  ): Listenable | Promise<Listenable>;
  fetchResult(
    request: Request,
    response: Response,
  ): FetchResult | Promise<FetchResult>;
}
