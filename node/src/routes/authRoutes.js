const express = require('express');

const localAuth = require('../auth/local');
const knex = require('../db/connection');
const authHelpers = require('../auth/helpers');

const router = express.Router();

// Route to register user
router.post('/signup', async (req, res) => {
  // Obtain username and password from the request
  const { username, password } = req.body;

  if (username === '' || password === '') {
    return res.status(200).json({ message: 'Invalid email or password' });
  }

  try {
    const user = await knex('users').where({ username }).first();

    if (user) throw new Error('user aready exist');

    const newUser = await authHelpers.createUser(req, res);
    const token = localAuth.encodeToken(newUser);

    return res.status(200).json({ message: 'user created', user: newUser, token });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'error in creating user' });
  }
});

// Route to authorize user from server and then user data.
// Middeware for user authorization
// @param req: request object
// @param res: response object
router.get('/user/data', authHelpers.ensureAuthenticated, async (req, res) => {
  const { user } = req;
  if (!user) return res.status(401).json({ message: 'unauthorized', staus: 'error' });

  if (user) return res.status(200).json({ user, status: 'success' });

  return res.status(500).json({ status: 'error' });
});

// Router for logging in to the web application.
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await knex('users').where({ username }).first();

    if (!user || !authHelpers.comparePassword(password, user.password)) {
      return res.status(401).json({ message: 'Incorrect password or username' });
    }

    const token = localAuth.encodeToken(user);

    return res.status(200).json({ user: { ...user, password: undefined }, token });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: e });
  }
});

module.exports = router;
