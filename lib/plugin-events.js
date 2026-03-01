const EventEmitter = require('eventemitter3');

const events = new EventEmitter();

// Emit in core code, e.g., in routes: events.emit('serverCreate', { serverId: '123' });

module.exports = events;
