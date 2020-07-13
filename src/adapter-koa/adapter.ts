import {Response, Request} from 'node-fetch';
import Koa, {Middleware, Context} from 'koa';

import {Adapter, Headers} from '..';
import {preuse} from './utilities';

export interface FetchResult extends Response {
  koaState: any;
}

export interface DecorationOptions {
  beforeMiddleware?: Middleware[];
  afterMiddleware?: Middleware[];
  state?: any;
}

export class KoaAdapter implements Adapter<FetchResult> {
  private contexts: Map<string, Context> = new Map();

  decorate(
    appOrMiddleware: Koa | Middleware,
    {
      state = {},
      beforeMiddleware = [],
      afterMiddleware = [],
    }: DecorationOptions = {},
  ) {
    const koa = appOrMiddleware instanceof Koa ? appOrMiddleware : new Koa();

    beforeMiddleware.reverse().forEach((middleware) => preuse(koa, middleware));

    preuse(koa, async (ctx, next) => {
      const id = ctx.get(Headers.SaddleId);
      this.contexts.set(id, ctx);
      ctx.state = state;
      await next();
    });

    if (typeof appOrMiddleware === 'function') {
      koa.use(appOrMiddleware);
    }
    afterMiddleware.forEach((middleware) => koa.use(middleware));

    return koa;
  }

  fetchResult(req: Request, resp: Response) {
    const id = req.headers.get(Headers.SaddleId);
    if (id == null) {
      throw new Error(
        `No ${Headers.SaddleId} header found on request: ${req}. This really shouldn't happen, are you manually using the adapter? If not file an issue please!`,
      );
    }

    const ctx = this.contexts.get(id);
    if (ctx == null) {
      throw new Error(
        `No context object found for ID ${id}. This really shouldn't happen, are you manually using the adapter? If not file an issue please!`,
      );
    }

    Object.defineProperty(resp, 'koaState', {value: ctx.state});
    return resp as FetchResult;
  }
}
