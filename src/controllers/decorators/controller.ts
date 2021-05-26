import 'reflect-metadata';
import { AppRouter } from '../../AppRouter';

export function controller(routerPrefix: string) {
  return function(target: Function) {
    const router = AppRouter.getInstance();

    for (let key in target.prototype) {
      const routerHandler = target.prototype[key];
      const path = Reflect.getMetadata('path', target.prototype, key);

      if (path) {
        router.get(`${routerPrefix}${path}`, routerHandler);
      }
    }
  };
}
