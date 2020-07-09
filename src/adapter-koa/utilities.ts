import Koa, {Middleware} from 'koa';

export function preuse(app: Koa, middleware: Middleware) {
  app.use(middleware);
  const lastmiddleware = app.middleware.pop();
  app.middleware.unshift(lastmiddleware!);
}
