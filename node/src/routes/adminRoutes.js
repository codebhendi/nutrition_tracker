const express = require('express');

const knex = require('../db/connection');
const authHelpers = require('../auth/helpers');

const router = express.Router();

// This file contains all routes used by the admin interface to update, delete and update an user
// or a meal

// Route to delete a meal for any user
router.post('/meals/delete/:id', authHelpers.ensureAuthenticated, async (req, res) => {
  const { user } = req;

  // check if user is admin
  if (!user.admin) return res.status(401).json({ message: 'Unauthorized' });

  // Obtain id of meal from url params to be deleted from request body.
  const { id } = req.params;

  try {
    // Make the deltion using knex
    await knex('calorie_count').del().where({ id });

    // If no errors return success
    return res.status(200).json({ message: 'deleted meal' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'Unable to delete meal', error: e });
  }
});

// Route to obtain a meal for any user to be edited
router.get('/meals/:id', authHelpers.ensureAuthenticated, async (req, res) => {
  const { user } = req;

  // check if user is admin
  if (!user.admin) return res.status(401).json({ message: 'Unauthorized' });

  // Obtain meal id from url params
  const { id } = req.params;

  try {
    // Query to obtain meal for a particular id
    const query = `
      select description, calories, date from calorie_count
      where id=?
    `;
    // Obtain meal data and send in response
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

  // check if user is admin
  if (!user.admin) return res.status(401).json({ message: 'Unauthorized' });

  // Obtain id of meal from url params and values to be updated from request body.
  const { id } = req.params;
  const { description, calorieCount, date } = req.body;

  if (!description || !calorieCount || !date) {
    return res.status(500).json({ messge: 'Invalid values' });
  }

  try {
    // Make the update using knex
    await knex('calorie_count')
      .update({ description, calorie_count: calorieCount, date })
      .where({ id });

    // If no errors return success
    return res.status(200).json({ message: 'updated meal' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'Unable to update meal', error: e });
  }
});

// Route to obtain all meals
router.get('/meals', authHelpers.ensureAuthenticated, async (req, res) => {
  const { user } = req;

  // check if user is admin
  if (!user.admin) return res.status(401).json({ message: 'Unauthorized' });

  try {
    // Query to obtain all users
    const query = `
      select calorie_count.id, description, username, calories, date from calorie_count
      inner join users on users.id = calorie_count.created_by
      order by calorie_count.created_at
    `;
    // Obtain meals and send as response
    const { rows: meals } = await knex.raw(query);

    return res.status(200).json({ message: meals });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'Unable to obtain meals', error: e });
  }
});

// Route to update an user to be edited from the id in url params
router.post('/users/delete/:id', authHelpers.ensureAuthenticated, async (req, res) => {
  const { user } = req;

  // check if user is admin
  if (!user.admin) return res.status(401).json({ message: 'Unauthorized' });
  // Obtain user id to be deleted.
  const { id } = req.params;

  // Update users and if success then send proper response
  try {
    // Delete from calorie_count all meals created by this user
    await knex('calorie_count').del().where({ created_by: id });
    // Delete the user after that
    await knex('users').del().where({ id });
    return res.status(200).json({ message: 'deleted user' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'Unable to delete user', error: e });
  }
});

// Route to obtain an user to be edited from the id in url params
router.get('/users/:id', authHelpers.ensureAuthenticated, async (req, res) => {
  const { user } = req;

  // check if user is admin
  if (!user.admin) return res.status(401).json({ message: 'Unauthorized' });
  // obtain user id from url params
  const { id } = req.params;

  try {
    // Query to obtain user information and send that as reponse
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

  // check if user is admin
  if (!user.admin) return res.status(401).json({ message: 'Unauthorized' });
  // Obtain user id and fields to be updated from request body.
  const { id } = req.params;
  const { username, caloriePerDay } = req.body;

  // Update users and if success then send proper response
  try {
    if (!username.trim) return res.status(500).json({ message: 'Invalid username' });
    const value = parseFloat(caloriePerDay);

    if (!value || Number.isNaN(value) || value < 100) {
      return res.status(500).json({ message: 'Invalid calorie per day' });
    }

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

  // check if user is admin
  if (!user.admin) return res.status(401).json({ message: 'Unauthorized' });

  try {
    // Query to obtain all users and send as reponse
    const query = 'select id, username, calorie_per_day from users order by created_at';
    const { rows: users } = await knex.raw(query);

    return res.status(200).json({ message: users });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'Unable to obtain users', error: e });
  }
});

module.exports = router;
