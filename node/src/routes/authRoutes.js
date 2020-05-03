const express = require('express');

const localAuth = require('../auth/local');
const knex = require('../db/connection');
const authHelpers = require('../auth/helpers');

const router = express.Router();

// Route to register user
router.post('/signup', async (req, res) => {
  // Obtain username and password from the request
  const { username, password } = req.body;
  // Remove additional spaces from usersname
  const parseUsername = username.trim();

  // Check if username and password are valid
  if (!parseUsername || !password) {
    return res.status(200).json({ message: 'Invalid email or password' });
  }

  try {
    // Check if user with same usename already exists
    const user = await knex('users').where({ username: parseUsername }).first();

    if (user) throw new Error('user aready exist');

    // Create new user and use the same to generate token for user authentication.
    const [newUser] = await authHelpers.createUser(req, res);
    const token = localAuth.encodeToken(newUser);

    return res.status(200).json({ message: 'user created', user: newUser, token });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'error in creating user' });
  }
});

// Route to authorize user from server and then user data.
router.get('/user/data', authHelpers.ensureAuthenticated, async (req, res) => {
  const { user } = req;
  if (!user) return res.status(401).json({ message: 'unauthorized', staus: 'error' });

  if (user) return res.status(200).json({ user, status: 'success' });

  return res.status(500).json({ status: 'error' });
});

// Router for logging in to the web application.
router.post('/login', async (req, res) => {
  // obtain username and password from request body.
  const { username, password } = req.body;
  // trim username to remove extra spaces
  const parseUsername = username.trim();

  if (!parseUsername || !password) return res.status(500).json({ message: 'Invalid request' });

  try {
    const user = await knex('users').where({ username: parseUsername }).first();

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
