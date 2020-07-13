import createServer, {HandleFunction} from 'connect';

export function preuse(app: createServer.Server, middleware: HandleFunction) {
  app.stack.unshift({route: '/', handle: middleware});
}
