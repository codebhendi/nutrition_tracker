const moment = require('moment');
const jwt = require('jsonwebtoken');

// Method used to encode service token so it can not
// be manipulated
const encodeServiceToken = (user) => {
  const payload = {
    iat: moment().unix(),
    sub: user.id,
  };

  return jwt.sign(payload, process.env.TOKEN_SECRET || 'my_secret');
};

// Function used to decode service token to authorize users
const decodeServiceToken = (token, callback) => {
  const payload = jwt.verify(token, process.env.TOKEN_SECRET || 'my_secret');
  callback(null, payload);
};

// Method used to encode token so it can not
// be manipulated
const encodeToken = (user) => {
  const payload = {
    exp: moment().add(30, 'days').unix(),
    iat: moment().unix(),
    sub: user.id,
  };

  return jwt.sign(payload, process.env.TOKEN_SECRET || 'my_secret');
};

// Method to decode token to authorize users
const decodeToken = (token, callback) => {
  const payload = jwt.verify(token, process.env.TOKEN_SECRET || 'my_secret');
  const now = moment().unix();
  // check if the token has expired
  if (now > payload.exp) callback('Token has expired.');
  else callback(null, payload);
};

module.exports = {
  encodeServiceToken,
  decodeServiceToken,
  encodeToken,
  decodeToken,
};
