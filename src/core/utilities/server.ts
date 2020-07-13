import {Server} from 'http';
import {Listenable, ListenableObject} from '../types';

export function listen(
  listenableOrFactory: Listenable,
  port = 0,
  host = '127.0.0.1',
) {
  return new Promise<Server>((resolve, reject) => {
    const listenable = isListenableObject(listenableOrFactory)
      ? listenableOrFactory
      : listenableOrFactory(port, host);

    if (listenable instanceof Server && listenable.listening) {
      return listenable;
    }

    const server = listenable
      .listen(port, host)
      .once('error', function (err: Error) {
        reject(err);
      })
      .once('listening', function () {
        resolve(server);
      });
  });
}

export function close(server: Server) {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function isListenableObject(
  listenableOrFactory: Listenable,
): listenableOrFactory is ListenableObject {
  return 'listen' in listenableOrFactory;
}
