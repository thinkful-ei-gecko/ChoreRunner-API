const express = require('express');
const path = require('path');
const { requireAuth } = require('../middleware/jwt-auth')
const HouseholdsService = require('./households-service');
const shortid = require('shortid');

const householdsRouter = express.Router();
const jsonBodyParser = express.json();

householdsRouter
.post('/', requireAuth, jsonBodyParser, async (req, res, next) => {
  const { name} = req.body;
  const owner_id = req.user.id;

    if (!name)
       return res.status(400).json({
        error: `Missing name in request body`,
      });

  try {
    //use short id to generate house code
    let house_code = `${name}` + shortid.generate();
    const newHousehold = {
      name,
      owner_id,
      house_code,
    };

    const house = await HouseholdsService.insertHousehold(
      req.app.get('db'),
      newHousehold
    );

    res.status(201).json({
      owner_id: house.owner_id,
      id: house.id,
      name: house.name,
      code: house.house_code,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = householdsRouter;