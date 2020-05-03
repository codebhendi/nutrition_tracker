const bcrypt = require('bcryptjs');
const localAuth = require('./local');
const knex = require('../db/connection');

// Function to create an  user registered via username
// req: request object
const createUser = (req) => {
  // Generate salt and then encrypt password using the salt
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(req.body.password, salt);

  // Enter the user object to the database adn return that created entry
  // Parameters required to insert in the database and rest of the fields are inserted via default
  // values
  // username: Usename user registered from
  // password: Password user used for registration
  // is_activated: Activation status for email check
  return knex('users')
    .insert({
      username: req.body.username,
      password: hash,
      is_activated: true,
    })
    .returning('*');
};

// Function to change user password
// password: String which will act as new password for the user
// id: Number to identiy user whose password is to be changed
const changePassword = (password, id) => {
  // Generate salt and hash to encrypt password
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(password, salt);

  // Updating passowrd
  return knex('users')
    .where({ id })
    .update({ password: hash })
    .then((data) => data)
    .catch((err) => console.log(err));
};

// Function to compare the password for user authentication in login
// @param userPassword: password passed by user for normal login
// @param dbPassword: encrypted password stored in database
const comparePassword = (userPassword, dbPassword) => bcrypt.compareSync(userPassword, dbPassword);

// Function to check if the token passed by the request is valid
// and authorizes the request
const ensureAuthenticated = (req, res, next) => {
  // checking the headers for authorization headers
  if (!(req.headers && req.headers.authorization)) return res.status(400).json({ status: 'Please log in' });

  // Obtain the token from headers structuer of our token in 'Bearere <token>'. So we split our
  // token string by space and take second entry to obtain actual token
  const [, token] = req.headers.authorization.split(' ');

  // Decode obtained token
  localAuth.decodeToken(token, async (err, payload) => {
    if (err) {
      console.log(err);
      return res.status(401).json({ status: 'Token has expired' });
    }

    try {
      // Obtain user from database
      const user = await knex('users').where({ id: parseInt(payload.sub, 10) }).first();

      // Check if the user is activated and we have an entry for the given user id.
      if (!user || !user.is_activated) return res.status(401).json({ status: 'error' });

      // store obtained user in request.
      req.user = { ...user, password: undefined };

      return next();
    } catch (e) {
      console.log(e);
      return res.status(500).json({ status: 'error' });
    }
  });

  return undefined;
};

module.exports = {
  createUser,
  comparePassword,
  ensureAuthenticated,
  changePassword,
};
