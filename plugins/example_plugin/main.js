module.exports = {
  register({ app, db, events, pluginManager }) {
    console.log('Example plugin registered!');
    // Use app, db, etc.
    // Example hook
    events.on('serverCreate', (data) => {
      console.log('Server created:', data);
      // e.g., db.insert({...});
    });
  },
  unregister({ app, db, events }) {
    console.log('Example plugin unregistered!');
    // Cleanup listeners, DB, etc.
    events.removeAllListeners('serverCreate');
  },
  router: (req, res) => {
    res.send('Hello from example plugin router!');
  }
};
