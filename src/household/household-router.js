const express = require('express');
const HouseholdService = require('./household-service');
const { requireAuth } = require('../middleware/jwt-auth');

const householdRouter = express.Router();
const bodyParser = express.json();

householdRouter
  .route('/:householdId/tasks')
  // .all(requireAuth)
  .post(bodyParser, (req, res, next) => {
    let { user_id, title, member_id, points } = req.body;
    const { householdId } = req.params;

    console.log(householdId);

    if (!title || !member_id || !points) {
      return res.status(400).json({error: {message: 'Missing task name, member id or points in request body'}});
    }
    
    const newTask = {
      title, 
      household_id: householdId,
      creator: user_id, 
      assigned: member_id, 
      points};

    // newTask.user_id = req.user.id;
    
    HouseholdService.insertTask(
      req.app.get('db'),
      newTask
    )
      .then(result => {
        res.status(201).json(result[0]);
      })
      .catch(next);
  });




module.exports = householdRouter;