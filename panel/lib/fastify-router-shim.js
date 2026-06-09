class FastifyRouter {
  constructor() {
    this.stack = [];
  }

  use(...args) {
    let path = '*';
    let handlers = args;
    if (typeof args[0] === 'string') {
      path = args[0];
      handlers = args.slice(1);
    }
    this.stack.push({ method: 'use', path, handlers: handlers.flat() });
    return this;
  }

  route(method, path, ...handlers) {
    this.stack.push({ method, path, handlers: handlers.flat() });
    return this;
  }

  get(path, ...handlers) { return this.route('GET', path, ...handlers); }
  post(path, ...handlers) { return this.route('POST', path, ...handlers); }
  put(path, ...handlers) { return this.route('PUT', path, ...handlers); }
  patch(path, ...handlers) { return this.route('PATCH', path, ...handlers); }
  delete(path, ...handlers) { return this.route('DELETE', path, ...handlers); }
  all(path, ...handlers) { return this.route(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'], path, ...handlers); }
  ws(path, ...handlers) { return this.route('WS', path, ...handlers); }
}

function Router() {
  return new FastifyRouter();
}

function staticNotAvailable() {
  throw new Error('Use @fastify/static in Fastify server setup instead of static middleware.');
}

module.exports = {
  Router,
  static: staticNotAvailable,
  json: () => (_req, _res, next) => next(),
  urlencoded: () => (_req, _res, next) => next(),
};
