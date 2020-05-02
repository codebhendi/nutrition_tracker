const express = require('express');

const knex = require('../db/connection');
const authHelpers = require('../auth/helpers');

const router = express.Router();

router.get('/get/managers', authHelpers.ensureAdmin, async (req, res) => {
  const query = `SELECT users.id, name from users
    inner join employee on users.id=employee.user_id
    where reporting_manager is null
  `;

  try {
    const { rows } = await knex.raw(query);
    return res.status(200).json({ message: rows });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'error' });
  }
});

router.post('/adduser', authHelpers.ensureAdmin, async (req, res) => {
  try {
    await authHelpers.createUserAdmin(req);
    return res.status(200).json({ message: 'user created' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'error' });
  }
});

router.get('/user/:id', authHelpers.ensureAdmin, async (req, res) => {
  const { id } = req.params;

  const query = `SELECT users.id, name, username, reporting_manager, is_activated, email
    from users
    left outer join employee on users.id=employee.user_id
    where users.id=?
  `;

  try {
    const { rows: [user] } = await knex.raw(query, [id]);
    return res.status(200).json({ message: user });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'error' });
  }
});

router.post('/edituser/:id', authHelpers.ensureAdmin, async (req, res) => {
  try {
    await authHelpers.editUser(req);
    return res.status(200).json({ message: 'user edited' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'error' });
  }
});

router.get('/', authHelpers.ensureAdmin, async (req, res) => {
  const query = `SELECT users.id, name, username, reporting_manager, is_activated
    from users
    left outer join employee on users.id=employee.user_id
    order by id
  `;

  try {
    const { rows } = await knex.raw(query);
    return res.status(200).json({ message: rows });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'error' });
  }
});

module.exports = router;
