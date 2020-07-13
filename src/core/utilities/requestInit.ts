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

export function getHeader(req: RequestInit, key: string) {
  if (req.headers == null) {
    return null;
  } else if (req.headers instanceof Headers) {
    req.headers.get(key);
  } else if (Array.isArray(req.headers)) {
    const existingHeader = req.headers.find(([headerKey]) => headerKey === key);
    return existingHeader && existingHeader[1];
  } else {
    return req.headers[key];
  }
}

export function hasHeader(req: RequestInit, key: string) {
  const currentValue = getHeader(req, key);
  return currentValue != null;
}

export function lacksHeader(req: RequestInit, key: string) {
  return !hasHeader(req, key);
}
