function normalizePath(routePath) {
  if (!routePath || routePath === '*') return '*';
  return routePath.replace(/\*/g, '*');
}

function decorateRequestReply(request, reply) {
  if (!request.path) request.path = request.url.split('?')[0];
  if (!request.originalUrl) request.originalUrl = request.url;
  if (!request.cookies) request.cookies = {};
  if (!request.get) request.get = (header) => request.headers[header.toLowerCase()];
  if (!request.protocol) request.protocol = request.headers['x-forwarded-proto'] || 'http';
  if (!request.ip) request.ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress;

  if (!reply.locals) reply.locals = {};

  if (!reply.code) reply.code = () => reply;
  if (!reply.header) reply.header = () => reply;

  const originalSend = reply.send.bind(reply);
  reply.send = (payload) => {
    reply.sent = true;
    return originalSend(payload);
  };

  const fastifyRedirect = reply.redirect ? reply.redirect.bind(reply) : null;
  reply.status = (c) => { reply.code(c); return reply; };
  reply.json = (payload) => reply.send(payload);
  reply.render = (view, data = {}) => {
    if (reply.view) {
        return reply.view(view, { ...reply.locals, ...data });
    }
    return reply.send({ view, data: { ...reply.locals, ...data } });
  };

  reply.redirect = (statusOrUrl, maybeUrl) => {
    reply.sent = true;
    if (typeof statusOrUrl === 'number') {
      reply.code(statusOrUrl);
      return fastifyRedirect ? fastifyRedirect(maybeUrl) : reply.header('location', maybeUrl).send();
    }
    return fastifyRedirect ? fastifyRedirect(statusOrUrl) : reply.header('location', statusOrUrl).code(302).send();
  };
  return { req: request, res: reply };
}

async function runHandlers(handlers, request, reply) {
  decorateRequestReply(request, reply);

  for (let i = 0; i < handlers.length; i++) {
    if (reply.sent) break;
    const handler = handlers[i];

    await new Promise((resolve, reject) => {
      let settled = false;
      const next = (nextErr) => {
        if (settled) return;
        settled = true;
        nextErr ? reject(nextErr) : resolve();
      };

      try {
        const result = handler(request, reply, next);
        if (reply.sent) {
            settled = true;
            return resolve();
        }
        if (result && typeof result.then === 'function') {
          result.then((value) => {
            if (!settled) {
              settled = true;
              if (value !== undefined && !reply.sent) reply.send(value);
              resolve();
            }
          }, reject);
        } else if (handler.length < 3) {
          settled = true;
          if (result !== undefined && !reply.sent) reply.send(result);
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
  }
}

function shouldRunMiddleware(routePath, requestPath) {
  if (!routePath || routePath === '*') return true;
  return requestPath === routePath || requestPath.startsWith(`${routePath}/`);
}

function registerRouter(app, router, prefix = '') {
  if (!router || !Array.isArray(router.stack)) {
    throw new TypeError('Expected a FastifyRouter from lib/fastify-router-shim');
  }

  for (const layer of router.stack) {
    const routePath = normalizePath(`${prefix}${layer.path === '*' ? '' : layer.path}` || '*');
    if (layer.method === 'use') {
      app.addHook('preHandler', async (request, reply) => {
        if (shouldRunMiddleware(routePath, request.url.split('?')[0])) {
          await runHandlers(layer.handlers, request, reply);
        }
      });
      continue;
    }

    if (layer.method === 'WS') {
      app.get(routePath, { websocket: true }, async (socket, request) => {
        const replyLike = { locals: {}, sent: false, send: () => {} };
        decorateRequestReply(request, replyLike);
        for (const handler of layer.handlers) {
          await handler(socket, request);
        }
      });
      continue;
    }

    app.route({
      method: layer.method,
      url: routePath,
      handler: async (request, reply) => runHandlers(layer.handlers, request, reply),
    });
  }
}

module.exports = { decorateRequestReply, registerRouter, runHandlers };
