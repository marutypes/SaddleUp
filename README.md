# 🐴 SaddleUp 🐴

## NOTE: not yet published, docs under heavy construction. Cbeck out the tests to get a feel for what is going on.

An easy-to-use testing framework for node servers everywhere.

```bash
yarn add saddle-up --dev
```

## ✨Features ✨

- Server framework agnostic (though comes with some extra niceties for [koa](https://koajs.com/))
- Testing framework agnostic (though comes with some handy matchers for [jest](https://jestjs.io/en/)
- Test the way you write code, using good-old `fetch`
- Minimal dependencies, take a look at our [package.json](package.json)!
- Parallel test safe
- Never worry about what ports your servers are using again
- Extensible with adapters
- Compiled to all the flavours of JS

## 🔧 Usage 🔧

SaddleUp allows you to test components with a focus on type safety and testing based on a component’s external API. In order to keep the API small and easy-to-use, it will generally track to only the latest minor release of React.

### The Gist

A testcase using saddle tends to have more or less the following structure:

- `saddle` your server (or middleware)
- call `fetch` on the saddled server
- make assertions on the resulting `Response`

You generally also want to call `unsaddle` after your test suite is complete, to clean up.

### Absolute minimum

You can use `SaddleUp` to test anything with a `listen` method that outputs a node `Server` instance. Even the raw `http` library itself.

With a basic server such as:

```ts
//server.mjs
import {createServer} from 'http';

export const server = createServer((req, res) => {
  res.writeHead(200);
  res.end('Hello, World!');
});
```

You could write tests using only `SaddleUp` and `assert` like so:

```ts
import * as assert from 'assert';
import {saddle} from 'saddle-up';

import {server} from './server';

const wrapper = await saddle(server);
const resp = await wrapper.fetch('/');

assert.equal(resp.status, 200);
```

### Jest, Matchers, Frameworks

`SaddleUp` provides a basis which can be built on for any server and test framework, but it also comes with a number of constructs on top of that basis tailored to work with specific tools.

These more complete examples use:

- jest as a test runner
- Koa as a server framework for the server under test
- SaddleUp's basic jest matchers
- SaddleUp's koa adapter
- SaddleUp's jest matches for the koa adapter

#### Full Server

TODO: this documentation

#### Middleware in isolation

If we had middleware like so:

```ts
//visit-counter.js
export function visitCounter(ctx, next) {
  ctx.state.visits += 1;
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
    const wrapper = await saddle(visitCounter, {state: {visits: 300}});
    const [, ctx] = await wrapper.fetch('/');
    await expect(ctx).toHaveKoaState({visits: 301});
  });
});
```

You'll notice that we didn't need to create a server at all. That is because `saddle-up/koa` is smart enough to handle creating a server for us and mounting our middleware. It even sets up our initial state.

### API

## Core

TODO: this documentation

## Adapters

TODO: this documentation

### Koa

TODO: this documentation

## Matchers

TODO: this documentation
