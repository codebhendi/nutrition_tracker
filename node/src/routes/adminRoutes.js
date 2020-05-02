const express = require('express');

const knex = require('../db/connection');
const authHelpers = require('../auth/helpers');

const router = express.Router();


// Route to obtain a meal for any user to be edited
router.get('/meals/:id', authHelpers.ensureAuthenticated, async (req, res) => {
  const { user } = req;
  const { id } = req.params;
  if (!user.admin) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const query = `
      select description, calories, date from calorie_count
      where id=?
    `;
    const { rows: meals } = await knex.raw(query, [id]);

    return res.status(200).json({ message: meals[0] });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'Unable to obtain meal', error: e });
  }
});

// Route to update a meal for any user to be edited
router.post('/meals/:id', authHelpers.ensureAuthenticated, async (req, res) => {
  const { user } = req;

  if (!user.admin) return res.status(401).json({ message: 'Unauthorized' });

  const { id } = req.params;
  const { description, calorieCount, date } = req.body;

  try {
    await knex('calorie_count')
      .update({ description, calorie_count: calorieCount, date })
      .where({ id });
    return res.status(200).json({ message: 'updated meal' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'Unable to update meal', error: e });
  }
});

// Route to obtain all meals
router.get('/meals', authHelpers.ensureAuthenticated, async (req, res) => {
  const { user } = req;

  if (!user.admin) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const query = `
      select calorie_count.id, description, username, calories, date from calorie_count
      inner join users on users.id = calorie_count.created_by
      order by calorie_count.created_at
    `;
    const { rows: meals } = await knex.raw(query);

    return res.status(200).json({ message: meals });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'Unable to obtain meals', error: e });
  }
});

// Route to obtain an user to be edited from the id in url params
router.get('/users/:id', authHelpers.ensureAuthenticated, async (req, res) => {
  const { user } = req;
  const { id } = req.params;
  if (!user.admin) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const query = 'select username, calorie_per_day from users where id=?';
    const { rows: users } = await knex.raw(query, [id]);

    return res.status(200).json({ message: users[0] });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'Unable to obtain user', error: e });
  }
});

// Route to update an user to be edited from the id in url params
router.post('/users/:id', authHelpers.ensureAuthenticated, async (req, res) => {
  const { user } = req;

  if (!user.admin) return res.status(401).json({ message: 'Unauthorized' });

  const { id } = req.params;
  const { username, caloriePerDay } = req.body;

  try {
    await knex('users')
      .update({ username, calorie_per_day: caloriePerDay })
      .where({ id });
    return res.status(200).json({ message: 'updated user' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'Unable to update user', error: e });
  }
});

// Route to obtain all users.
router.get('/users', authHelpers.ensureAuthenticated, async (req, res) => {
  const { user } = req;

  if (!user.admin) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const query = 'select id, username, calorie_per_day from users order by created_at';
    const { rows: users } = await knex.raw(query);

    return res.status(200).json({ message: users });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'Unable to obtain users', error: e });
  }
});

module.exports = router;
