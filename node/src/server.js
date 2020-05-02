const debug = require('debug')('server:server');
const http = require('http');
const app = require('./app');

const normalizePort = (val) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) { return val; }
  if (port >= 0) { return port; }
  return false;
};

console.log('starting');

const port = normalizePort(process.env.USER_PORT || '3000');

const onError = (error) => {
  console.log(error);
  if (error.syscall !== 'listen') { throw error; }
  switch (error.code) {
    case 'EACCES':
      process.exit(1);
      break;
    case 'EADDRINUSE':
      process.exit(1);
      break;
    default:
      throw error;
  }
};

console.log('creating server');
const server = http.createServer(app);
server.setTimeout(1000 * 60 * 5);
console.log('started server');

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `Pipe ${port}` : `Port ${port}`;
  debug(`Listening on ${bind}`);
};

console.log('listening on port');

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

process.on('uncaughtException', (exception) => {
  console.log(exception);
});

console.log('on');
