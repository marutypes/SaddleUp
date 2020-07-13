import {Response, Request} from 'node-fetch';
import createServer, {HandleFunction} from 'connect';

import {Adapter} from '..';
import {preuse} from './utilities';

export type FetchResult = Response;

export interface DecorationOptions {
  beforeMiddleware?: HandleFunction[];
  afterMiddleware?: HandleFunction[];
}

export class ConnectAdapter implements Adapter<FetchResult> {
  decorate(
    appOrMiddleware: HandleFunction | createServer.Server,
    {beforeMiddleware = [], afterMiddleware = []}: DecorationOptions = {},
  ) {
    const app =
      typeof appOrMiddleware === 'function' ? createServer() : appOrMiddleware;

    beforeMiddleware.reverse().forEach((middleware) => preuse(app, middleware));

    if (typeof appOrMiddleware === 'function') {
      app.use(appOrMiddleware);
    }
    afterMiddleware.forEach((middleware) => app.use(middleware));

    return app;
  }

  fetchResult(_req: Request, resp: Response) {
    return resp as FetchResult;
  }
}
