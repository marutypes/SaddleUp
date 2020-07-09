import {Server} from 'http';
import fetch, {RequestInit, Request} from 'node-fetch';

import {getFree, inUse} from './utilities/ports';
import {getIdFactory} from './utilities/id';
import {listen, close} from './utilities/server';
import {setHeader} from './utilities/requestInit';
import {Listenable, Adapter, Options} from './types';

export const ID_HEADER = 'X-SaddleUp-ID-Header';

export class SaddleUp<FetchResult> {
  private static instances: SaddleUp<unknown>[] = [];

  static async closeAll() {
    for (const server of SaddleUp.instances) {
      await server.stop();
    }
  }

  static async create<T>(
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
      ...opts,
    };

    const server = await listen(listenable, options.port, options.host);
    return new SaddleUp<T>(server, adapter);
  }

  private nextId = getIdFactory();

  private constructor(
    private server: Server,
    private adapter: Adapter<FetchResult>,
  ) {
    SaddleUp.instances.push(this);
  }

  get address() {
    const addr = this.server.address();

    if (addr == null) {
      throw new Error(`Cannot find the address of server: ${this.server}`);
    }

    return typeof addr === 'string' ? addr : `${addr.address}:${addr.port}`;
  }

  stop() {
    return close(this.server);
  }

  async fetch(path: string, requestOptions: RequestInit = {}) {
    setHeader(requestOptions, ID_HEADER, `${this.nextId()}`);
    const req = new Request(`http://${this.address}/${path}`, requestOptions);
    const resp = await fetch(req);
    return this.adapter.fetchResult(req, resp);
  }
}
