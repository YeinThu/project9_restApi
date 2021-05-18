const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const { authenticateUser } = require('../middleware/auth-user');
const { User } = require('../models');

/* Global async route handler */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    }
    catch (error) {
      // Forward error to the global error handler
      next(error);
    }
  }
};

/* GET return authenticated user */
router.get('/', authenticateUser, asyncHandler((req, res) => {
  const { firstName, lastName, emailAddress } = req.currentUser;

  res.json({
    firstName,
    lastName,
    emailAddress
  });
}));

/* POST create a new user */
router.post('/', asyncHandler(async (req, res, next) => {
  const user = req.body;

  try {
    // If user password is entered, hash it
    if (user.password) {
      user.password = bcryptjs.hashSync(user.password, 10);
    }

    const newUser = await User.create(user);

    res.location('/').status(201).end();
  } 
  catch (error) {
    console.log(error.name);
    
    if (error.name === 'SequelizeUniqueConstraintError' || error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json(errors);
    }
    else {
      // All other errors forwarded to the global error handler
      next(error);
    }
  }

}));

module.exports = router;