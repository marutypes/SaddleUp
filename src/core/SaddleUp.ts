import {Server} from 'http';
import fetch, {RequestInit, Request, Response} from 'node-fetch';
import {CookieJar, MemoryCookieStore} from 'tough-cookie';

import {getFree, inUse} from './utilities/ports';
import {getIdFactory} from './utilities/id';
import {listen, close} from './utilities/server';
import {setHeader, lacksHeader} from './utilities/requestInit';
import {Listenable, Adapter, Options} from './types';

export enum Headers {
  SaddleId = 'X-Saddleup-Id',
  Cookie = 'Cookie',
  SetCookie = 'Set-Cookie',
}

export class SaddleUp<FetchResult extends Response = Response> {
  private static instances: SaddleUp[] = [];

  static async closeAll() {
    for (const server of SaddleUp.instances) {
      await server.stop();
    }

    SaddleUp.instances = [];
  }

  static async create<T extends Response = Response>(
    listenable: Listenable,
    adapter: Adapter<T>,
    opts: Partial<Options> = {},
  ) {
    if (opts.port && (await inUse(opts.port))) {
      throw new Error(
        'The provided port is in use. Please try a different port or allow the library to select a free one automatically by omitting the option.',
      );
    }

    const options = {
      host: '127.0.0.1',
      port: opts.port || (await getFree()),
      cookies: {},
      ...opts,
    };

    const server = await listen(listenable, options.port, options.host);
    const saddle = new SaddleUp<T>(server, adapter);

    for (const cookieName of Object.keys(options.cookies)) {
      saddle.setCookie(cookieName, options.cookies[cookieName]);
    }

    return saddle;
  }

  private cookieJar: CookieJar;
  private nextId = getIdFactory();

  private constructor(
    private server: Server,
    private adapter: Adapter<FetchResult>,
  ) {
    this.cookieJar = new CookieJar(new MemoryCookieStore(), {looseMode: true});
    SaddleUp.instances.push(this);
  }

  get cookieString() {
    return this.cookieJar.getCookieStringSync(this.host);
  }

  get cookies() {
    const cookies: Record<string, string> = {};
    for (const cookie of this.cookieJar.getCookiesSync(this.host)) {
      const {key, value} = cookie;
      cookies[key] = value;
    }
    return cookies;
  }

  get host() {
    const addr = this.server.address();

    if (addr == null) {
      throw new Error(`Cannot find the address of server: ${this.server}`);
    }

    return typeof addr === 'string' ? addr : `${addr.address}:${addr.port}`;
  }

  get address() {
    return `http://${this.host}`;
  }

  stop() {
    return close(this.server);
  }

  setCookie(cookie: string, value: string) {
    this.setRawCookie(`${cookie}=${value}`);
  }

  clearCookies() {
    return this.cookieJar.removeAllCookies();
  }

  async fetch(pathOrUrl: string, requestOptions: RequestInit = {}) {
    // We wrap the path in a `Url` object to make it act like browser fetch,
    // which defaults path fragments to using the current location's hostname
    const url = new URL(pathOrUrl, this.address);

    // We set a special header on all requests so we can know what fetch
    // req/resp objects correspond to values on the server side
    setHeader(requestOptions, Headers.SaddleId, `${this.nextId()}`);

    if (lacksHeader(requestOptions, 'cookie')) {
      setHeader(requestOptions, 'cookie', this.cookieString);
    }

    const req = new Request(url.href, requestOptions);
    const resp = await fetch(req);

    const setCookieString = resp.headers.get(Headers.SetCookie);
    if (setCookieString && setCookieString.length > 0) {
      this.setRawCookie(setCookieString);
    }

    return this.adapter.fetchResult(req, resp);
  }

  private setRawCookie(cookie: string) {
    this.cookieJar.setCookieSync(cookie, this.host);
  }
}
