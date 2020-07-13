import {Response as FetchResult, Request as FetchRequest} from 'node-fetch';
import express, {Handler, Express} from 'express';

import {Adapter, Options} from '..';
import {preuse} from './utilities';

export {FetchResult};

export interface DecorationOptions extends Options {
  beforeMiddleware?: Handler[];
  afterMiddleware?: Handler[];
}

export class ExpressAdapter
  implements Adapter<Handler | Express, FetchResult, DecorationOptions> {
  decorate(
    appOrMiddleware: Handler | Express,
    {
      beforeMiddleware = [],
      afterMiddleware = [],
    }: Partial<DecorationOptions> = {},
  ) {
    const app =
      typeof appOrMiddleware === 'function' ? express() : appOrMiddleware;

    beforeMiddleware.reverse().forEach((middleware) => preuse(app, middleware));

    if (typeof appOrMiddleware === 'function') {
      app.use(appOrMiddleware);
    }
    afterMiddleware.forEach((middleware) => app.use(middleware));

    return app;
  }

  fetchResult(_req: FetchRequest, resp: FetchResult) {
    return resp;
  }
}
