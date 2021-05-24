const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth-user');
const { Course, User } = require('../models');

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
}

/* GET return a list of all courses including the User that owns each course */
router.get('/', asyncHandler(async (req, res) => {
  const courses = await Course.findAll({
    // Return specified attributes, excepte for 'createdAt' and 'updatedAt'
    attributes: ["id", "title", "description", "estimatedTime", "materialsNeeded", "userId"],
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName", "emailAddress"]
      }
    ]
  });

  res.json(courses);
}));

/* GET return corresponding course along with the User that owns that course */
router.get('/:id', asyncHandler(async (req, res, next) => {
  const course = await Course.findByPk(req.params.id, {
    // Return specified attributes, excepte for 'createdAt' and 'updatedAt'
    attributes: ["id", "title", "description", "estimatedTime", "materialsNeeded", "userId"],
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName", "emailAddress"]
      }
    ]
  });

  // If a course exists and is retrieved...
  if (course) {
    res.json(course);
  } 
  // Else, forward error to 404 error handler
  else {
    next();
  }
}));

/* POST create a new course */
router.post('/', authenticateUser, asyncHandler(async (req, res, next) => {
  const course = req.body;
  // let existingCourseByUser;
  
  // try {
  //   if (course.title) {
  //     // Check to see if a course is already owned by a specific user
  //     existingCourseByUser = await Course.findOne({
  //       where: {
  //         userId: course.userId,
  //         title: course.title
  //       }
  //     });
  //   }

  //   // If that user already owns the course...
  //   if (existingCourseByUser) {
  //     const user = await User.findByPk(existingCourseByUser.userId);

  //     res.status(400).json({ 
  //       message: `This course is already owned by ${user.firstName} ${user.lastName}.` 
  //     });
  //   }
  //   // Else, if the user has not yet owned the course, create that course
  //   else {
  //     const newCourse = await Course.create(course);
  //     res.location(`/api/courses/${newCourse.id}`).status(201).end();
  //   }
   
  // } 
  // catch (error) {
  //   console.log(error.name)

  //   if (error.name === 'SequelizeValidationError') {
  //     const errors = error.errors.map(err => err.message);
  //     res.status(400).json(errors);
  //   }
  //   else {
  //     // All other errors forwarded to the global error handler
  //     next(error);
  //   }
  // }

  try {
    const newCourse = await Course.create(course);
    res.location(`/api/courses/${newCourse.id}`).status(201).end();
  } 
  catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json(errors);
    }
    else {
      // All other errors forwarded to the global error handler
      next(error);
    }
  }
}));

/* PUT update corresponding course */
router.put('/:id', authenticateUser, asyncHandler(async (req, res, next) => {
  const course = await Course.findByPk(req.params.id, {
    // Return specified attributes, excepte for 'createdAt' and 'updatedAt'
    attributes: ["id", "title", "description", "estimatedTime", "materialsNeeded", "userId"],
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName", "emailAddress"]
      }
    ]
  });
  
  // If a course exists in the database...
  if (course) {
    // If the course exists and belongs to the user...
    if (course.userId === req.currentUser.id) {
      try {
        await course.update(req.body);
        res.status(204).end();
      } 
      catch (error) {
        if (error.name === 'SequelizeValidationError') {
          const errors = error.errors.map(err => err.message);
          res.status(400).json(errors);
        }
        else {
          // All other errors forwarded to the global error handler
          next(error);
        }
      }
    }
    // If the course exists but it does not belong to the user...
    else {
      res.status(403).json({ message: 'Unathorized user. Permission denied.' });
    }
  }
  // If a course is non-existent, forward to the 404 error handler
  else {
    next();
  }
}));

/* DELETE delete corresponding course */
router.delete('/:id', authenticateUser, asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id, {
    // Return specified attributes, excepte for 'createdAt' and 'updatedAt'
    attributes: ["id", "title", "description", "estimatedTime", "materialsNeeded", "userId"],
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName", "emailAddress"]
      }
    ]
  });
  
  // If a course exists in the database...
  if (course) {
    // If the course exists and belongs to the user...
    if (course.userId === req.currentUser.id) {
      await course.destroy();
      res.status(204).end();
    }
    // If the course exists but it does not belong to the user...
    else {
      res.status(403).json({ message: 'Unathorized user. Permission denied.' });
    }
  }
  // If a course is non-existent, forward to the 404 error handler
  else {
    next();
  }
}));

module.exports = router;