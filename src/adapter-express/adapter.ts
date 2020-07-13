import {Response as FetchResult, Request as FetchRequest} from 'node-fetch';
import express, {Handler, Express} from 'express';

import {Adapter} from '..';
import {preuse} from './utilities';

export {FetchResult};

export interface DecorationOptions {
  beforeMiddleware?: Handler[];
  afterMiddleware?: Handler[];
}

export class ExpressAdapter implements Adapter<FetchResult> {
  decorate(
    appOrMiddleware: Handler | Express,
    {beforeMiddleware = [], afterMiddleware = []}: DecorationOptions = {},
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
