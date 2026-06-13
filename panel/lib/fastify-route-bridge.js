function normalizePath(routePath) {
  if (!routePath || routePath === '*') return '*';
  return routePath.replace(/\*/g, '*');
}

function isSystemObject(obj) {
    if (!obj || typeof obj !== 'object') return false;
    // Check for standard request/reply/socket objects
    if (obj.constructor && (
        obj.constructor.name === 'IncomingMessage' ||
        obj.constructor.name === 'ServerResponse' ||
        obj.constructor.name === 'Socket' ||
        obj.constructor.name === 'FastifyRequest' ||
        obj.constructor.name === 'FastifyReply'
    )) return true;

    // Fallback detection for objects with too much internal state
    if (obj.headers !== undefined && obj.socket !== undefined) return true;
    if (obj.raw !== undefined && obj.id !== undefined && obj.params !== undefined) return true;

    return false;
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

  if (!reply.status) reply.status = (c) => { reply.raw.statusCode = c; return reply; };

  // Patch methods to return undefined to prevent circular structure errors
  // when an async handler returns the reply object itself.
  if (!reply._patchedBridge) {
      reply._patchedBridge = true;

      const originalSend = reply.send.bind(reply);
      reply.send = (payload) => {
        if (reply.sent || reply.raw.writableEnded) return;
        if (isSystemObject(payload)) {
            originalSend();
        } else {
            originalSend(payload);
        }
      };

      reply.json = (payload) => {
        reply.send(payload);
      };

      const originalRender = reply.render;
      reply.render = (view, data = {}) => {
        if (typeof originalRender === 'function' && reply.view) {
            reply.view(view, { ...reply.locals, ...data });
        } else {
            reply.send({ view, data: { ...reply.locals, ...data } });
        }
      };

      const fastifyRedirect = reply.redirect.bind(reply);
      reply.redirect = (statusOrUrl, maybeUrl) => {
        if (reply.sent || reply.raw.writableEnded) return;
        if (typeof statusOrUrl === 'number') {
            fastifyRedirect(statusOrUrl, maybeUrl);
        } else {
            fastifyRedirect(statusOrUrl);
        }
      };
  }

  return { req: request, res: reply };
}

async function runHandlers(handlers, request, reply) {
  decorateRequestReply(request, reply);

  for (let i = 0; i < handlers.length; i++) {
    if (reply.sent || reply.raw.writableEnded) return;
    const handler = handlers[i];

    await new Promise((resolve, reject) => {
      let settled = false;

      const done = (err) => {
        if (settled) return;
        settled = true;
        if (err) return reject(err);
        resolve();
      };

      const next = (err) => done(err);

      // Listen for finishing events to settle correctly
      const onFinish = () => {
          reply.raw.removeListener('finish', onFinish);
          reply.raw.removeListener('close', onFinish);
          done();
      };
      reply.raw.on('finish', onFinish);
      reply.raw.on('close', onFinish);

      try {
        const result = handler(request, reply, next);

        if (reply.sent || reply.raw.writableEnded) {
            return done();
        }

        if (result && typeof result.then === 'function') {
          result.then((value) => {
            if (!settled) {
              if (value !== undefined && !reply.sent && !reply.raw.writableEnded && !isSystemObject(value)) {
                  reply.send(value);
              }
              done();
            }
          }, (err) => {
            if (!settled) done(err);
          });
        } else if (handler.length < 3) {
          if (!settled) {
              if (result !== undefined && !reply.sent && !reply.raw.writableEnded && !isSystemObject(result)) {
                  reply.send(result);
              }
              done();
          }
        } else {
            // Callback handler, safety timeout
            setTimeout(() => {
                if (!settled && !reply.sent && !reply.raw.writableEnded) {
                    done();
                }
            }, 10000);
        }
      } catch (error) {
        if (!settled) done(error);
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
        const replyLike = { locals: {}, sent: false, send: () => {}, raw: { setHeader: () => {}, writableEnded: false }, status: () => {} };
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
