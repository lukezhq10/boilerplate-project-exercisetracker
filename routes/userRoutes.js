const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

// POST request to add new user
router.post('/', userController.add_user);

// GET request to get all users in the DB in an array
router.get('/', userController.get_users);
  
// POST request to add new exercise
router.post('/:_id/exercises', userController.add_exercise);
  
// GET request to get exercise log of a user
router.get('/:_id/logs', userController.get_exercise_log)

module.exports = router;