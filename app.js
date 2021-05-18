'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const { sequelize } = require('./models/index');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// Added middleware
app.use(express.json());

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);

// Test database connection
(async () => {
  await sequelize.authenticate()
  .then(() => {
    console.log('Connection to database has been established successfully');
  })
  .catch(error => {
    console.log(`Unable to connect to the database: ${error}`);
  });
})();

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
