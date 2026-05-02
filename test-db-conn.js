const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgres://ksuser:kspanelpassword@localhost:5432/kspanel',
});
client.connect()
  .then(() => {
    console.log('Connected successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error', err.stack);
    process.exit(1);
  });
