
const express = require('express');
// const path = require('path');
// const { requireAuth } = require('../middleware/jwt-auth');
const HouseholdsService = require('../households/households-service');
const { requireMemberAuth } = require('../middleware/member-jwt');
const xss = require('xss');

const membersRouter = express.Router();
const jsonBodyParser = express.json();

membersRouter
  .route('/')
  .get(requireMemberAuth, async (req, res, next) => {
    const member_id = req.member.id;

    try {
      const userScores = await HouseholdsService.getLevels(
        req.app.get('db'),
        member_id
      );

      //show distance to next level
      userScores.nextLevel = (userScores.level_id * 10) - (userScores.total_score);

      res.status(201).send(userScores);
    } catch (error) {
      next(error);
    }
  })

module.exports = membersRouter
