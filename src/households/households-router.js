const express = require('express');
const path = require('path');
const { requireAuth } = require('../middleware/jwt-auth');
const HouseholdsService = require('./households-service');
const { requireMemberAuth } = require('../middleware/member-jwt');
// const shortid = require('shortid');

const householdsRouter = express.Router();
const jsonBodyParser = express.json();

householdsRouter
  .route('/')
  .all(requireAuth)
  .post(jsonBodyParser, async (req, res, next) => {
    const { name } = req.body;
    const user_id = req.user.id;

    if (!name)
      return res.status(400).json({
        error: `Missing name in request body`,
      });

    try {
      //use short id to generate house code
      // let house_code = `${name}` + shortid.generate();
      const newHousehold = {
        name,
        user_id,
      };

      const house = await HouseholdsService.insertHousehold(
        req.app.get('db'),
        newHousehold
      );

      res.status(201).json({
        owner_id: house.user_id,
        id: house.id,
        name: house.name,
        // code: house.house_code,
      });
    } catch (error) {
      next(error);
    }
  })
  .get((req, res, next) => {
    const user_id = req.user.id;
    console.log(user_id);
    return HouseholdsService.getAllHouseholds(req.app.get('db'), user_id)
      .then(households => {
        return res.json(households);
      })
      .catch(next);
  });

householdsRouter
  .route('/:householdId')
  .all(requireAuth)
  .delete(jsonBodyParser, (req, res, next) => {
    const { householdId } = req.params;

    HouseholdsService.deleteHousehold(req.app.get('db'), householdId)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

householdsRouter
  .route('/:householdId/tasks')
  .all(requireAuth)
  .post(jsonBodyParser, (req, res, next) => {
    let { user_id, title, member_id, points } = req.body;
    console.log(title, member_id, points);
    const { householdId } = req.params;

    if (!title || !member_id || !points) {
      return res.status(400).json({
        error: {
          message: 'Missing task name, member id or points in request body',
        },
      });
    }

    const newTask = {
      title,
      household_id: householdId,
      // user_id,

      member_id,
      points,
    };

    newTask.user_id = req.user.id;

    HouseholdsService.insertTask(req.app.get('db'), newTask)
      .then(result => {
        res.status(201).json(result[0]);
      })
      .catch(next);
  })

  .get((req, res, next) => {
    const { householdId } = req.params;
    console.log('hello');
    return HouseholdsService.getTasksForAll(req.app.get('db'), householdId)
      .then(tasks => {
        const result = {};
        tasks.forEach(task => {
          if (task.member_id in result) {
            result[task.member_id].tasks.push({
              title: task.title,
              id: task.id,
              points: task.points,
            });
          } else {
            result[task.member_id] = {
              member_id: task.member_id,
              name: task.name,
              username: task.username,
              tasks: [{ title: task.title, id: task.id, points: task.points }],
            };
          }
        });
        return res.json(result);
      })
      .catch(next);
  })
  .patch(jsonBodyParser, (req, res, next) => {
    console.log(req.body);
    if (req.body.method === 'points') {
      HouseholdsService.updateTaskPoints(
        req.app.get('db'),
        req.body.id,
        req.body.points
      )
        .then(() => {
          res.send('points updated');
        })
        .catch(next);
    }

    if (req.body.method === 'title') {
      HouseholdsService.updateTaskTitle(
        req.app.get('db'),
        req.body.id,
        req.body.title
      )
        .then(() => {
          res.send('title updated');
        })
        .catch(next);
    }
  });

householdsRouter
  .route('/:householdId/tasks/:taskId')
  .all(requireAuth)
  .delete((req, res, next) => {
    const { taskId } = req.params;
    HouseholdsService.deleteTask(req.app.get('db'), taskId)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

//NOTE: THIS ENDPOINT USES THE MEMBER'S AUTHTOKEN, NOT PARAMS.
//MIGHT WANT TO FIX THIS BEFORE DEPLOY
householdsRouter
  .route('/householdId/members/memberId/tasks')
  .all(requireMemberAuth)
  .get((req, res, next) => {
    console.log(req.member);
    HouseholdsService.getMemberTasks(
      req.app.get('db'),
      req.member.household_id,
      req.member.id
    )

      .then(result => {
        res.status(201).json(result);
      })
      .catch(next);
  })
  .delete(jsonBodyParser, (req, res, next) => {
    const { taskId } = req.body;
    console.log(taskId);
    HouseholdsService.completeTask(
      req.app.get('db'),
      req.member.id,
      req.member.household_id,
      taskId
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

householdsRouter
  .route('/:householdId/members')
  .all(requireAuth)
  .get((req, res, next) => {
    const { householdId } = req.params;

    return HouseholdsService.getAllMembers(req.app.get('db'), householdId)
      .then(tasks => {
        return res.json(tasks);
      })
      .catch(next);
  })
  .post(jsonBodyParser, async (req, res, next) => {
    const { password, username, name } = req.body;
    const user_id = req.user.id;
    const { householdId } = req.params;
    console.log(password, username, name);

    for (const field of ['name', 'username', 'password'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`,
        });

    try {
      // const passwordError = MembersService.validatePassword(password)

      // if (passwordError)
      //   return res.status(400).json({ error: passwordError })

      const hasMemberwithMemberName = await HouseholdsService.hasMemberwithMemberName(
        req.app.get('db'),
        username
      );

      if (hasMemberwithMemberName)
        return res.status(400).json({ error: `Username already taken` });

      const hashedPassword = await HouseholdsService.hashPassword(password);

      const newMember = {
        username,
        password: hashedPassword,
        name,
        household_id: householdId,
        user_id,
      };

      const member = await HouseholdsService.insertMember(
        req.app.get('db'),
        newMember
      );

      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${member.id}`))
        .json(HouseholdsService.serializeMember(member));
    } catch (error) {
      next(error);
    }
  })
  //delete members
  .delete(jsonBodyParser, (req, res, next) => {
    const { member_id } = req.body;
    console.log(member_id)
    HouseholdsService.deleteMember(req.app.get('db'), member_id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })

householdsRouter
  .route('/:householdId/members/:memberId')
  .all(requireAuth)
   // Currently, not allowing users to reassign households to members.
  .patch(jsonBodyParser, async (req, res, next) => {
    const { name, username, password } = req.body;
    const { memberId } = req.params;

    try {
      //check to see that updated userName isn't a duplicate
      const hasMemberwithMemberName = await HouseholdsService.hasMemberwithMemberName(
        req.app.get('db'),
        username
      );

      if (hasMemberwithMemberName) {
        return res.status(400).json({ error: `Username already taken.` });
      }

      //update password needs to be rehashed
      const hashedPassword = await HouseholdsService.hashPassword(password);

      const updatedMember = { name, username, password: hashedPassword };

      //Check to see that there are actually values passed to be updated
      const numberOfValues = Object.values(updatedMember).filter(Boolean)
        .length;

      if (numberOfValues === 0) {
        return res.status(400).json({
          error: `Request must contain name, username, password, or household`,
        });
      }

      const updated = await HouseholdsService.updateMember(
        req.app.get('db'),
        memberId,
        updatedMember
      );

      return res.status(201).json(updated);
    } catch (error) {
      next(error);
    }
  });

householdsRouter
  .route('/:id')
  .all(requireAuth)
  .get((req, res, next) => {
    const { id } = req.params;
    return HouseholdsService.getAllHouseholds(req.app.get('db'), id)
      .then(households => {
        return res.json(households);
      })
      .catch(next);
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const { id } = req.params;
    const { name, user_id } = req.body;
    const newHousehold = { name, user_id };
    const db = req.app.get('db');

    const householdVals = Object.values(newHousehold).filter(Boolean).length;
    if (householdVals === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain household 'name'.`,
        },
      });
    }
    HouseholdsService.updateHouseholdName(db, id, newHousehold)
      .then(() => res.status(204).end())
      .catch(next);
  });

module.exports = householdsRouter;
