import {Context} from 'koa';
import {
  matcherHint,
  printExpected,
  printReceived,
  RECEIVED_COLOR as receivedColor,
  matcherErrorMessage,
} from 'jest-matcher-utils';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R, T = {}> {
      toHaveKoaState(state: any): void;
    }
  }
}

function toHaveKoaState(this: jest.MatcherUtils, ctx: Context, given: any) {
  const expectation = 'toHaveKoaState';
  const notExpectation = `.not.${expectation}`;
  const isNot = this.isNot;

  assertIsContext(ctx, {
    expectation,
    isNot,
  });

  const pass = Object.keys(given).every((key) =>
    this.equals(ctx.state[key], given[key]),
  );

  const prettyCtx = JSON.stringify(ctx);
  const prettyGivenState = JSON.stringify(given);
  const prettyState = JSON.stringify(ctx.state);

  const message = pass
    ? () =>
        `${matcherHint(notExpectation, 'response')}\n\n` +
        `Expected the ctx:\n  ${receivedColor(prettyCtx)}\n` +
        `Not to contain state:\n  ${printExpected(prettyState)}\n` +
        `But it did:\n  ${receivedColor(prettyGivenState)}\n`
    : () =>
        `${matcherHint('.not.toContainReactText', 'response')}\n\n` +
        `Expected the ctx:\n  ${receivedColor(prettyCtx)}\n` +
        `With state:\n  ${printReceived(prettyGivenState)}\n` +
        `To contain state:\n  ${printExpected(prettyState)}\n`;

  return {pass, message};
}

function assertIsContext(
  ctx: any,
  {expectation, isNot}: {expectation: string; isNot: boolean},
) {
  if (ctx == null || typeof ctx !== 'object' || ctx.state == null) {
    throw new Error(
      matcherErrorMessage(
        matcherHint(`.${expectation}`, undefined, undefined, {isNot}),
        `${receivedColor('received')} value must be a Context object`,
        `Received ${receivedColor(ctx)}.`,
      ),
    );
  }
}

expect.extend({
  toHaveKoaState,
});
