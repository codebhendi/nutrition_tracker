const express = require('express');

const knex = require('../db/connection');
const authHelpers = require('../auth/helpers');

const router = express.Router();

// Route to store general information of the user.
// This is the one time information.
router.get('/', authHelpers.ensureAuthenticated, async (req, res) => {
  // Obtain user and data from requestt.
  const { user } = req;

  if (!user.admin) return res.status(401).json({ message: 'Not authorized' });

  try {
    // Check if user has already stored the information
    const query = `
      select id, description, calories, created_at, username from calorie_count
      inner join users on users.id=calorie_count.created_by
      where order by created_at
    `;
    const { rows } = await knex.raw(query);

    return res.status(200).json({ message: rows });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'error' });
  }
});

router.get('/edit/:id', authHelpers.ensureAuthenticated, async (req, res) => {
  const { user } = req;

  if (!user.admin) return res.status(401).json({ message: 'Not authorized' });

  const { id } = req.params;
  const query = `select description, calories from calorie_count where id=${id}`

  try {
    const { rows } = await knex.raw(query);
    return res.status(200).json({ status: 'success', message: rows });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'unable to insert data' });
  }
});

router.post('/edit/:id', authHelpers.ensureAuthenticated, async (req, res) => {
  const { user } = req;

  if (!user.admin) return res.status(401).json({ message: 'Not authorized' });

  const { id } = req.params;
  const { description, calorieCount } = req.body;

  try {
    await knex('calorie_count')
      .update({ description, calories: calorieCount })
      .where({ created_by: id });
    return res.status(200).json({ status: 'success' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'unable to insert data' });
  }
});

module.exports = router;
