'use strict';

const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');
const { User } = require('../models');

exports.authenticateUser = async (req, res, next) => {
  // Store the message to display based on authentication result
  let message;

  const credentials = auth(req);

  // If the user's credentials are available
  if (credentials) {
    const user = await User.findOne({
      where: {
        emailAddress: credentials.name
      }
    });

    // If a user was successfully retrieved from the database...
    if (user) {
      // compareSync() returns a boolian
      const authenticated = bcryptjs.compareSync(credentials.pass, user.password); 

      // If passwords match...
      if (authenticated) {
        console.log(`Authentication successful for the email address: ${user.emailAddress}`);

        // Store the user on the Request object
        req.currentUser = user;
      } else {
        message = `Authentication failure for email address: ${user.emailAddress}`;
      }
    } else {
      message = `User not found under the email address: ${credentials.name}`;
    }
  } else {
    message = 'Authorization header not found.';
  }

  // If a message has a value (meaning an error has occured)
  if (message) {
    return res.status(401).json({ message: 'Access Denied.' })
  } else {
    next();
  }

};