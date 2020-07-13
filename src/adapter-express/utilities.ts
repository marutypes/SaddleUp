import {Handler, Express} from 'express';

export function preuse(app: Express, middleware: Handler) {
  app.stack.unshift({route: '/', handle: middleware});
}
