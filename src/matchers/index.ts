import {toHaveBodyText, toHaveBodyJson} from './body';
import {toHaveStatus, toHaveStatusText} from './status';
import {toHaveSetCookie, toHaveCookies} from './cookies';
import {toHaveHeaders} from './headers';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R, T = {}> {
      toHaveBodyJson(json: any): Promise<void>;
      toHaveBodyText(text: string): Promise<void>;
      toHaveStatus(status: number): Promise<void>;
      toHaveHeaders(headers: Record<string, string>): Promise<void>;
      toHaveStatusText(status: string): Promise<void>;
      toHaveSetCookie(cookieName: string, value?: string): Promise<void>;
      toHaveCookies(cookies: Record<string, string>): Promise<void>;
    }
  }
}

expect.extend({
  toHaveBodyText,
  toHaveBodyJson,
  toHaveStatus,
  toHaveHeaders,
  toHaveStatusText,
  toHaveSetCookie,
  toHaveCookies,
});
