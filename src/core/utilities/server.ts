import {Server} from 'http';
import {Listenable} from '../types';

export function listen(
  listenable: Listenable | Server,
  port = 0,
  host = '127.0.0.1',
) {
  return new Promise<Server>((resolve, reject) => {
    const server = listenable.listen(port, host);

    server.once('error', function (err: Error) {
      reject(err);
    });

    server.once('listening', function () {
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
