# 🐴 SaddleUp 🐴

![CI status](https://github.com/TheMallen/SaddleUp/workflows/CI/badge.svg)
[![npm version](https://badge.fury.io/js/saddle-up.svg)](https://badge.fury.io/js/saddle-up)

An easy-to-use testing framework for node servers everywhere.

```bash
yarn add saddle-up --dev
```

## ✨Features ✨

- Server framework agnostic (though comes with some extra niceties for [Express](https://github.com/expressjs/express)/[connect](https://github.com/senchalabs/connect) style middleware, and for [koa](https://koajs.com/))
- Testing framework agnostic (though comes with some handy matchers for [jest](https://jestjs.io/en/))
- Test the way you write code, using the standard `fetch` API and `Response` / `Request` objects
- Minimal dependencies, take a look at our [package.json](package.json)!
- Parallel test safe
- Handles choosing ports intelligently
- Extensible with adapters
- Compiled to all the flavours of JS
- Written in delicious TypeScript and shipped with full types and type inference
- Supports redirects, persisting cookies between requests, and more!

## 🔧 Usage 🔧

### The Gist

A testcase using saddle tends to have more or less the following structure:

- `saddle` your server (or middleware)
- call `fetch` on the saddled server
- make assertions on the resulting `Response`

You generally also want to call `unsaddle` after your test suite is complete, to clean up.

### Absolute Minimum

You can use `SaddleUp` to test anything with a `listen` method that outputs a node `Server` instance. Even the raw `http` library itself.

With a basic server such as:

```ts
//server.js
const {createServer} = require('http');

export const server = createServer((req, res) => {
  res.writeHead(200);
  res.end('Hello, World!');
});
```

You could write tests using only `SaddleUp` and `assert` like so:

```ts
//server.test.js
const assert = require('assert');
const {saddle} = require('saddle-up');
const {server} = require('./server');

async function runTest() {
  const wrapper = await saddle(server);
  const resp = await wrapper.fetch('/');

  assert.equal(resp.status, 200);
}

runTest();
```

But there is nothing stopping you from importing applications with any framework and testing them. All you need to pass to `saddle` is an object with a `listen` method that returns an `http` server, and you're ready to go on your testing journey.

### Jest, Matchers, Frameworks

`SaddleUp` provides a basis which can be built on for any server and test framework, but it also comes with a number of constructs on top of that basis tailored to work with specific tools. There are several [adapters](#adapters) which ship with the library for popular server libraries, which allow saddleing of individual middleware and some other niceties. There are also a number of useful [matchers](#matchers) for the popular [jest](https://jestjs.io/en/) testing framework which can simplify writing assertions.

#### Express

`saddle-up/express` provides a wrapped version of `saddle` for testing Express applications. For example, if we had a middleware in our Express application like so:

```ts
//visit-counter.js
let visits = 0;

export function visitCounter(_req, res) {
  visits += 1;
  res.setHeader('x-visits', visits);
}
```

We can write a simple test with `SaddleUp` for it like:

```ts
//visit-counter.test.js
import 'saddle-up/matchers';
import {saddle} from 'saddle-up/express';
import {visitCounter} from './visit-counter';

describe('MyApp', () => {
  it('iterates visitors every visit', async () => {
    const wrapper = await saddle(visitCounter);
    const resp = await wrapper.fetch('/');
    expect(resp).toHaveHeaders({'x-visits': 1}
  });
});
```

You'll notice that we didn't need to create a server at all. That is because `saddle-up/koa` is smart enough to handle creating a server for us and mounting our middleware.

Note: This also still works with full applications just like the default `saddle`, and is compatible with all the same matchers.

#### Koa

`saddle-up/koa` provides a wrapped version of `saddle` for testing Koa applications. For example, if we had a middleware in our Koa application like so:

```ts
let visits = 0;

//visit-counter.js
export function visitCounter(ctx, next) {
  visits += 1;
  ctx.state.visits = visits;
  await next();
}
```

We can write a simple test with `SaddleUp` for it like:

```ts
//visit-counter.test.js
import 'saddle-up/matchers';
import 'saddle-up/matchers/koa';
import {saddle} from 'saddle-up/koa';
import {visitCounter} from './visit-counter';

describe('MyApp', () => {
  it('iterates visitors every visit', async () => {
    const wrapper = await saddle(visitCounter);
    const resp = await wrapper.fetch('/');
    expect(resp).toHaveKoaState({visits: 1});
  });
});
```

You'll notice that we didn't need to create a server at all. That is because `saddle-up/koa` is smart enough to handle creating a server for us and mounting our middleware. It even knows how to check the `state` value of the corresponding Koa context object to our response.

Note: This also still works with full applications just like the default `saddle`, and is compatible with all the same matchers.

## API

### Core

#### saddle

Wraps a `Listenable` (anything with a `listen` method that returns an HTTP server) in a `SaddleUp` instance for testing.

```ts
import {saddle} from 'saddle-up';
import app from './app';

const wrapper = saddle(app);
```

A number of options are also available.

```ts
interface Options {
  // specify a custom host (defaults to `127.0.0.1`)
  host: string;
  // specify a custom port (defaults to finding a free one automatically)
  port: number;
  // specify starting cookies (defaults to an empty object)
  cookies: Record<string, string>;
}
```

Additionally, you can also pass a `ListenerFactory` to facilitate wrapping unusual server APIs which don't have an adapter pre-built.

```ts
const wrapper = await saddle((port, host) =>
  somethingThatReturnsAServer(port, host),
);
```

#### `unsaddle()`

Runs `stop` on every instance of `saddle` which has been created.

#### `SaddleUp`

The class instantiated and customized by the `saddle` function.

##### `fetch()`

Exposes a wrapped `node-fetch` for use against the listenable the instance wraps.

```tsx
const resp = await wrapper.fetch('/some-path');
```

##### `address`

The fully qualified hostname (with protocol) of the running server

##### `cookies`

A vanilla object representing the cookie key and values which have been persisted

##### `setCookie(name, value)`

Persists a cookie with the given name and value

##### `clearCookies()`

Clears all the persisted cookies on the current instance

##### `stop()`

Closes the underlying `Listenable`.

### Adapters

#### Express

##### `saddle()`

Wraps an Express application _or middleware_ in a `SaddleUp` instance for testing.

```ts
import {saddle} from 'saddle-up/express';
import app from './app';

const wrapper = saddle(app);
```

All of the usual options are available, but you may also decorate the server that ends up mounted by adding `beforeMiddleware` and `afterMiddleware`.

#### `unsaddle()`

Runs `stop` on every instance of `saddle` which has been created.

#### Connect

##### `saddle()`

Wraps a Connect application _or middleware_ in a `SaddleUp` instance for testing.

```ts
import {saddle} from 'saddle-up/connect';
import app from './app';

const wrapper = saddle(app);
```

All of the usual options are available, but you may also decorate the server that ends up mounted by adding `beforeMiddleware` and `afterMiddleware`.

#### `unsaddle()`

Runs `stop` on every instance of `saddle` which has been created.

#### Koa

##### `saddle()`

Wraps an Express application _or middleware_ in a `SaddleUp` instance for testing.

```ts
import {saddle} from 'saddle-up/koa';
import app from './app';

const wrapper = saddle(app);
```

All of the usual options are available, but you may also decorate the server that ends up mounted by adding `beforeMiddleware` and `afterMiddleware`, or provide custom initial `ctx.state`.

#### `unsaddle()`

Runs `stop` on every instance of `saddle` which has been created.

### Matchers

`SaddleUp` provides a number of matchers for Jest. They are divided between the core set which works for anything and adapter specific bundles.

#### Core

`import 'saddle-up/matches'`

To register all the default matchers to your `expect`, just add this line to your test setup file or to individual tests. The matchers below will become available when this is imported.

##### `toHaveBodyJson(response)`

This matcher checks if the response JSON matches a subset of key/value pairs.

```ts
await expect(response).toHaveBodyJson({foo: 'bar'});
```

##### `toHaveBodyText(response)`

This matcher checks if the response text contains a substring.

```ts
await expect(response).toHaveBodyText('something');
```

##### `toHaveStatus(response)`

This matcher checks if the response status is a specific number.

```ts
await expect(response).toHaveStatus(200);
```

##### `toHaveHeaders(response)`

This matcher checks if the response headers match a subset of key/value pairs.

```ts
await expect(response).toHaveHeaders({'x-foo': 'bar'});
```

##### `toHaveStatusText(response)`

This matcher checks if the response's statusText is a specific string.

```ts
await expect(response).toHaveStatusText('OK');
```

##### `toHaveSetCookie(response)`

This matcher checks if a specific cookie was set on the response, optionally it can also check if it was set to a specific value.

```ts
await expect(response).toHaveSetCookie('user');
await expect(response).toHaveSetCookie('user', 'maru');
```

##### `toHaveCookies(wrapper)`

This matcher checks if the wrapper has persisted a subset of key/value pairs.

```ts
await expect(wrapper).toHaveCookies({user: 'maru'});
```

#### Koa

##### `toHaveKoaState(response)`

This matcher checks if the corresponding `ctx` object for a given request has a subset of key/value pairs on it's `state`.

```ts
await expect(wrapper).toHaveKoaState({user: 'maru'});
```

## FAQ

### How do I make this work with a framework that doesn't expose `.listen`?

Some libraries do not use the standard `.listen` API to generate a server. That's no problem for `SaddleUp` though. You can use the alternative API to pass a function to your saddle instance.

For example, we could hook up `hapi` like so:

```ts
import Hapi from '@hapi/hapi';
import {saddle} from 'saddle-up';
import someHapiRoute from './route';

const wrapper = await saddle((port, host) => {
  const server = Hapi.server({
    port,
    host,
  });

  server.route(someHapiRoute);

  server.start();
  return server.listener;
});

const resp = await wrapper.fetch('/');
```

With this function API you can make it work for all sorts of frameworks.

### How can I write a custom matcher?

This part of the docs is under construction. if you are really excited to make a thing, check out the existing adapters for inspiration.

## Contributing

Feel free to open issues or PRs, I may or may not have time to get to the promptly but they are definitely appreciated.
