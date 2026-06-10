function normalizePath(routePath) {
  if (!routePath || routePath === '*') return '*';
  return routePath.replace(/\*/g, '*');
}

function decorateRequestReply(request, reply) {
  if (!request.path) request.path = request.url.split('?')[0];
  if (!request.originalUrl) request.originalUrl = request.url;
  if (!request.cookies) request.cookies = {};
  if (!request.get) request.get = (header) => request.headers[header.toLowerCase()];
  if (!request.protocol) request.protocol = request.headers['x-forwarded-proto'] || (request.socket.encrypted ? 'https' : 'http');
  if (!request.ip) request.ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress;

  if (!reply.locals) reply.locals = {};

  if (!reply.code) reply.code = (c) => { reply.status(c); return reply; };
  if (!reply.header) reply.header = (n, v) => { reply.raw.setHeader(n, v); return reply; };

  if (!reply._originalSend) {
      reply._originalSend = reply.send.bind(reply);
      reply.send = (payload) => {
        if (reply.sent) return reply;
        reply.sent = true;
        return reply._originalSend(payload);
      };
  }

  const fastifyRedirect = reply.redirect.bind(reply);
  if (!reply.status) reply.status = (c) => { reply.raw.statusCode = c; return reply; };
  if (!reply.json) reply.json = (payload) => reply.send(payload);
  if (!reply.render) reply.render = (view, data = {}) => {
    if (reply.view) {
        return reply.view(view, { ...reply.locals, ...data });
    }
    return reply.send({ view, data: { ...reply.locals, ...data } });
  };

  reply.redirect = (statusOrUrl, maybeUrl) => {
    if (reply.sent) return reply;
    if (typeof statusOrUrl === 'number') {
      return fastifyRedirect(statusOrUrl, maybeUrl);
    }
    return fastifyRedirect(statusOrUrl);
  };
  return { req: request, res: reply };
}

async function runHandlers(handlers, request, reply) {
  decorateRequestReply(request, reply);

  for (let i = 0; i < handlers.length; i++) {
    if (reply.sent) return;
    const handler = handlers[i];

    await new Promise((resolve, reject) => {
      let settled = false;
      const next = (nextErr) => {
        if (settled) return;
        settled = true;
        if (nextErr) return reject(nextErr);
        resolve();
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
          }, (err) => {
            if (!settled) {
              settled = true;
              reject(err);
            }
          });
        } else if (handler.length < 3) {
          settled = true;
          if (result !== undefined && !reply.sent) reply.send(result);
          resolve();
        } else {
            const timeout = setTimeout(() => {
                if (!settled && !reply.sent) {
                    next();
                }
            }, 10000);

            const originalSend = reply.send;
            reply.send = (p) => {
                clearTimeout(timeout);
                reply.send = originalSend;
                return reply.send(p);
            };
        }
      } catch (error) {
        if (!settled) {
          settled = true;
          reject(error);
        }
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
        const replyLike = { locals: {}, sent: false, send: () => {}, raw: { setHeader: () => {} } };
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
