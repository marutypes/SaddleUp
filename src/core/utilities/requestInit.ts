import {RequestInit, Headers} from 'node-fetch';

export function setHeader(req: RequestInit, key: string, value: string) {
  if (req.headers == null) {
    req.headers = {[key]: value};
  } else if (req.headers instanceof Headers) {
    req.headers.set(key, value);
  } else if (Array.isArray(req.headers)) {
    req.headers.push([key, value]);
  } else {
    req.headers[key] = value;
  }
}
