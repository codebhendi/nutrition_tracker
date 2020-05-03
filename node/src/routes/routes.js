const express = require('express');

const knex = require('../db/connection');
const authHelpers = require('../auth/helpers');

const router = express.Router();

// Route to add new meals for the user making the request
router.post('/meals/add', authHelpers.ensureAuthenticated, async (req, res) => {
  const { user } = req;

  // Obtain fields to be inserted from request body
  const { description, calorieCount, date } = req.body;

  // Check if those values are valid
  if (!description || !calorieCount || !date) return res.status(500).json({ message: 'Description ,calorie count and date are required' });

  try {
    // Insert these values and send success reponse
    await knex('calorie_count')
      .insert({
        description, calories: calorieCount, date, created_by: user.id,
      });
    return res.status(200).json({ message: 'success' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'unable to insert data', error: e });
  }
});

// Route to delete a meal of an user represented by the id in url parms.
router.post('/meals/delete/:id', authHelpers.ensureAuthenticated, async (req, res) => {
  // Obtain user and data from requestt.
  const { user } = req;
  // Obtain meal id from url params
  const { id } = req.params;

  try {
    // Delete meal using meal id and send success response
    await knex('calorie_count').del().where({ created_by: user.id, id });
    return res.status(200).json({ message: 'meal deleted' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'unable to delete meal', error: e });
  }
});

// Route to get a meal of an user represented by the id in url parms.
router.get('/meals/:id', authHelpers.ensureAuthenticated, async (req, res) => {
  // Obtain user and data from requestt.
  const { user } = req;
  // Obtain meal id from request params
  const { id } = req.params;

  try {
    // Obtain meal data from the id using sql query adn send as response
    const query = `
      select id, description, calories, date from calorie_count
      where created_by=? and id=? order by created_at
    `;
    const { rows } = await knex.raw(query, [user.id, id]);

    return res.status(200).json({ message: rows[0] });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'unable to obtain list of meals', error: e });
  }
});

// Route to update a meal of an user represented by the id in url parms.
router.post('/meals/:id', authHelpers.ensureAuthenticated, async (req, res) => {
  // Obtain user and data from requestt.
  const { user } = req;
  // Obtain meal id from url params
  const { id } = req.params;
  // Obtain values to update meal data.
  const { description, calories, date } = req.body;

  // Chekc if obtained values are valid
  if (!description || !calories || !date) return res.status(500).json({ message: 'Description ,calorie count and date are required' });

  try {
    // Update values using meal id and send success response
    await knex('calorie_count')
      .update({ description, calories, date })
      .where({ created_by: user.id, id });
    return res.status(200).json({ message: 'meal updated' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'unable to update meal', error: e });
  }
});

// Route to get all the meals of an user.
router.get('/meals', authHelpers.ensureAuthenticated, async (req, res) => {
  const { user } = req;

  try {
    // Query to obtain all meals created for this user.
    const query = `
      select id, description, calories, date from calorie_count
      where created_by=${user.id} order by created_at
    `;
    const { rows: meals } = await knex.raw(query);

    // Query to obtain daily consumption of the user
    const queryConsumption = `
      select date, sum(calories) from calorie_count
      where created_by=${user.id} group by date
      order by date
    `;

    const { rows: consumption } = await knex.raw(queryConsumption);

    // Send consumption and meals to user
    return res.status(200).json({ message: { meals, consumption } });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'unable to obtain list of meals', error: e });
  }
});

router.post('/profile/resetpassword', authHelpers.ensureAuthenticated, async (req, res) => {
  const { user } = req;
  const { username, caloriePerDay } = req.body;

  try {
    const cpd = parseFloat(caloriePerDay);

    if (cpd < 100 || Number.isNaN(cpd)) {
      return res.status(500).json({ message: 'caloriePerDay must be greater than 100' });
    }

    if (!username) return res.status(500).json({ message: 'username length must be more than 0' });

    await knex('users').update({ username, calorie_per_day: caloriePerDay }).where({ id: user.id });
    return res.status(200).json({ message: 'uesr updated' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'unable to edit user', error: e });
  }
});

// Route to update profile information of an user.
router.post('/profile', authHelpers.ensureAuthenticated, async (req, res) => {
  const { user } = req;
  // Obtain information to be updated from request body
  const { username, caloriePerDay } = req.body;
  // Parse username to remove extra spaces.
  const parseUsername = username.trim();

  try {
    // Check if values are valid
    if (!parseUsername) return res.status(500).json({ message: 'Invalid username' });

    const cpd = parseFloat(caloriePerDay);

    if (cpd < 100 || Number.isNaN(cpd)) {
      return res.status(500).json({ message: 'caloriePerDay must be greater than 100' });
    }

    if (!username) return res.status(500).json({ message: 'username length must be more than 0' });

    // Update user information.
    await knex('users')
      .update({ username: parseUsername, calorie_per_day: caloriePerDay }).where({ id: user.id });
    return res.status(200).json({ message: 'uesr updated' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'unable to edit user', error: e });
  }
});

module.exports = router;
