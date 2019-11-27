const express = require('express');
const path = require('path');
const { requireAuth } = require('../middleware/jwt-auth')
const MembersService = require('./members-service')

const membersRouter = express.Router();
const jsonBodyParser = express.json();

membersRouter
  .route('/')
  .all(requireAuth)
  .post(jsonBodyParser, async (req, res, next) => {
    const { password, username, name, household_id } = req.body
    const user_id = req.user.id

    for (const field of ['name', 'username', 'password', 'household_id'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        })

    try {
      const passwordError = MembersService.validatePassword(password)

      if (passwordError)
        return res.status(400).json({ error: passwordError })

      const hasMemberwithMemberName = await MembersService.hasMemberwithMemberName(
        req.app.get('db'),
        username
      )

      if (hasMemberwithMemberName)
        return res.status(400).json({ error: `Username already taken` })

      const hashedPassword = await  MembersService.hashPassword(password)

      const newMember = {
        username,
        password: hashedPassword,
        name,
        household_id,
        user_id,
      }

      const member = await MembersService.insertMember(
        req.app.get('db'),
        newMember
      )

      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${member.id}`))
        .json(MembersService.serializeMember(member))
    } catch(error) {
      next(error)
    }
  })
 

  module.exports = membersRouter;