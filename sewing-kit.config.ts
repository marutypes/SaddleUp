import {createPackage, Runtime} from '@sewing-kit/config';
import {javascript} from '@sewing-kit/plugin-javascript';
import {typescript} from '@sewing-kit/plugin-typescript';
import {eslint} from '@sewing-kit/plugin-eslint';
import {jest} from '@sewing-kit/plugin-jest';
import {buildFlexibleOutputs} from '@sewing-kit/plugin-package-flexible-outputs';

export default createPackage((pkg) => {
  pkg.runtime(Runtime.Node);
  pkg.entry({root: './src/index'});
  pkg.entry({name: 'koa', root: './src/adapter-koa'});
  pkg.entry({
    name: 'matchers',
    root: './src/matchers/index',
  });
  pkg.entry({
    name: 'koa-matchers',
    root: './src/matchers/koa',
  });
  pkg.use(jest(), eslint(), javascript(), typescript(), buildFlexibleOutputs());
});
