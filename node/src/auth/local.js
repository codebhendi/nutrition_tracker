const moment = require('moment');
const jwt = require('jsonwebtoken');

// Function used to encode token that so it can not
// be manipulated
// user: User information to be stored in the token
const encodeToken = (user) => {
  // In the token we store the expiry and time of creation along with user id.
  const payload = {
    exp: moment().add(30, 'days').unix(),
    iat: moment().unix(),
    sub: user.id,
  };

  // Encode the token using secret stored in envrionment variable
  return jwt.sign(payload, process.env.TOKEN_SECRET || 'my_secret');
};

// Function to decode token to authorize users
// Parameters:
// token: Token to be decoded.
// callback: Functino to be called if error or toke decoded successfully.
const decodeToken = (token, callback) => {
  const payload = jwt.verify(token, process.env.TOKEN_SECRET || 'my_secret');
  const now = moment().unix();

  // check if the token has expired
  if (now > payload.exp) callback('Token has expired.');
  else callback(null, payload);
};

module.exports = {
  encodeToken,
  decodeToken,
};
