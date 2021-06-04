import 'reflect-metadata';
import { AppRouter } from '../../AppRouter';
import { Methods } from './Methods';
import { MetadataKeys } from './MetadataKeys';
import { RequestHandler, Request, Response, NextFunction } from 'express';

function bodyValidators(keys: string): RequestHandler {
  return function(req: Request, res: Response, next: NextFunction) {
    if (!req.body) {
      res.status(422).send('Invalid request');
      return;
    }

    for (let key of keys) {
      if (!req.body[key]) {
        res.status(422).send(`Missing property ${key}`);
        return;
      }
    }

    next();
  };
}

export function controller(routerPrefix: string) {
  return function(target: Function) {
    const router = AppRouter.getInstance();

    for (let key in target.prototype) {
      const routerHandler = target.prototype[key];
      const path = Reflect.getMetadata(MetadataKeys.path, target.prototype, key);
      const method: Methods = Reflect.getMetadata(MetadataKeys.method, target.prototype, key);
      const middlewares = Reflect.getMetadata(MetadataKeys.middleware, target.prototype, key) || [];
      const requireBodyProps = Reflect.getMetadata(MetadataKeys.validator, target.prototype, key) || [];

      const validator = bodyValidators(requireBodyProps);

      if (path) {
        router[method](`${routerPrefix}${path}`, ...middlewares, validator, routerHandler);
      }
    }
  };
}
