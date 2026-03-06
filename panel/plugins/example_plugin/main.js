module.exports = {
  register({ app, db, events, pluginManager }) {
    console.log('Registered with access to app, db, events!');
    events.on('panelStart', (data) => {
      console.log('Panel started:', data);
    });
  },
  unregister({ app, db, events }) {
    console.log('Unregistering...');
    events.removeAllListeners();
  },
  router: function(req, res) {
    res.send('Plugin route!');
  }
};
