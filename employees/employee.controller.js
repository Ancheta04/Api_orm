const express = require('express');
const router = express.Router();
const db = require('../_helpers/db');

// GET all employees
router.get('/', async (req, res, next) => {
  try {
    const employees = await db.Employee.findAll();
    res.json(employees);
  } catch (err) {
    next(err);
  }
});

// POST create employee
router.post('/', async (req, res, next) => {
  try {
    const employee = await db.Employee.create(req.body);
    res.json(employee);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

