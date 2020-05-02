const bcrypt = require('bcryptjs');
const localAuth = require('./local');
const knex = require('../db/connection');

// Function to create an  user registered via email
// req: request object
const createUser = (req) => {
  // Generate salt and then encrypt password using the salt
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(req.body.password, salt);

  // Enter the user object to the database
  // Parameters required to insert in the database
  // local_email: Email user registered from
  // local_password: Password user used for registration
  // is_activated: Activation status for email check
  // admin: Admin status of the account
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

  // decode the token
  const [, token] = req.headers.authorization.split(' ');

  localAuth.decodeToken(token, async (err, payload) => {
    if (err) {
      console.log(err);
      return res.status(401).json({ status: 'Token has expired' });
    }

    try {
      // Obtain user from database
      const user = await knex('users').where({ id: parseInt(payload.sub, 10) }).first();

      if (!user || !user.is_activated) return res.status(401).json({ status: 'error' });

      req.user = { ...user, password: undefined };

      return next();
    } catch (e) {
      console.log(e);
      return res.status(500).json({ status: 'error' });
    }
  });

  return undefined;
};

// Function to check if the token passed by the request is valid
// and authorizes the request
const ensureAdmin = (req, res, next) => {
  // checking the headers for authorization headers
  if (!(req.headers && req.headers.authorization)) return res.status(400).json({ status: 'Please log in' });

  // decode the token
  const [, token] = req.headers.authorization.split(' ');

  localAuth.decodeToken(token, async (err, payload) => {
    if (err) {
      console.log(err);
      return res.status(401).json({ status: 'Token has expired' });
    }

    try {
      // Obtain user from database
      const user = await knex('users').where({ id: parseInt(payload.sub, 10) }).first();

      if (!user || !user.is_activated || !user.admin) return res.status(401).json({ status: 'error' });

      req.user = { ...user, password: undefined };

      return next();
    } catch (e) {
      console.log(e);
      return res.status(500).json({ status: 'error' });
    }
  });

  return undefined;
};

const getAllUsers = () => {
  return knex('users').select();
};

const getUser = (id) => {
  return knex('users')
    .where({ id })
    .first()
    .then(((data) => knex('employees')
      .where({ user_id: id })
      .first()
      .then((employee) => ({ ...data, employee }))
      .catch((error) => console.log(error))))
    .catch((err) => console.log(err));
};

/* eslint-disable camelcase */
const editUser = async (req) => {
  const { username } = req.body;
  const { id } = req.params;

  try {
    await knex('users').where({ id }).update({ username });
  } catch (e) {
    console.log(e);
    throw new Error('error in editing user');
  }
};

module.exports = {
  createUser,
  comparePassword,
  ensureAuthenticated,
  ensureAdmin,
  getAllUsers,
  getUser,
  editUser,
  changePassword,
};
