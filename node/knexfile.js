const path = require('path');

module.exports = {
  client: 'pg',
  connection: `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  migrations: {
    directory: path.join(__dirname, 'src', 'db', 'migrations'),
  },
};
