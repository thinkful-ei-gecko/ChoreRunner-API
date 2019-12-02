const express = require('express');
const path = require('path');
const { requireAuth } = require('../middleware/jwt-auth')
const HouseholdsService = require('./households-service');
const {requireMemberAuth} = require('../middleware/member-jwt')
// const shortid = require('shortid');

const householdsRouter = express.Router();
const jsonBodyParser = express.json();

householdsRouter
  .route('/')
  .all(requireAuth)
  .post(jsonBodyParser, async (req, res, next) => {
    const { name } = req.body;
    const user_id = req.user.id;

  console.log(name, user_id)
 
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
    return HouseholdsService.getAllHouseholds(
      req.app.get('db'),
      user_id
    )
      .then(households => {
        return res.json(households)
      })
      .catch(next);
  })

householdsRouter
  .route('/:householdId/tasks')
  .all(requireAuth)
  .post(jsonBodyParser, (req, res, next) => {
    let { user_id, title, member_id, points } = req.body;
    const { householdId } = req.params;

    if (!title || !member_id || !points) {
      return res.status(400).json({error: {message: 'Missing task name, member id or points in request body'}});
    }
    
    const newTask = {
      title, 
      household_id: householdId,
      // user_id, 
      member_id, 
      points};

    newTask.user_id = req.user.id;
    
    HouseholdsService.insertTask(
      req.app.get('db'),
      newTask
    )
      .then(result => {
        res.status(201).json(result[0]);
      })
      .catch(next);
  })

  .get((req, res, next) => {
    const { householdId } = req.params;
    console.log('hello');
    return HouseholdsService.getTasksForAll(
      req.app.get('db'),
      householdId
    )
      .then(tasks => {
        const result = {};
        tasks.forEach(task => {
          if (task.member_id in result) {
            result[task.member_id].tasks.push({'title': task.title, 'id': task.id, 'points': task.points});
          } else {
            result[task.member_id] = {
                              name: task.name,
                              tasks: [{'title': task.title, 'id': task.id, 'points': task.points}]
                            }
          }
        })
        return res.json(result)
      })
      .catch(next);
  })
  .patch(jsonBodyParser, (req, res, next) => {
    console.log(req.body)
    if(req.body.method === 'points'){
      HouseholdsService.updateTaskPoints(req.app.get('db'), req.body.id, req.body.points)
      .then( () => {
        res.send('points updated')
      })
      .catch(next)
    }

    if(req.body.method === 'title'){
      HouseholdsService.updateTaskTitle(req.app.get('db'), req.body.id, req.body.title)
      .then( () => {
        res.send('title updated')
      })
      .catch(next)
    }
  })

  //NOTE: THIS ENDPOINT USES THE MEMBER'S AUTHTOKEN, NOT PARAMS. 
  //MIGHT WANT TO FIX THIS BEFORE DEPLOY
  householdsRouter
    .route('/householdId/members/memberId/tasks')
    .all(requireMemberAuth)
    .get((req, res, next) => {
      console.log(req.member)
      HouseholdsService.getMemberTasks(
        req.app.get('db'),
        req.member.household_id,
        req.member.id,
      )
      .then(result => {
        res.status(201).json(result)
      })
      .catch(next)
    })
    .delete(jsonBodyParser, (req, res, next) => {
      const {taskId} =req.body
      console.log(taskId)
      HouseholdsService.completeTask(
        req.app.get('db'),
        req.member.id,
        req.member.household_id,
        taskId
      ).then(() => {
        res.status(204).end()
      })
      .catch(next)
    })


  householdsRouter
  .route('/:householdId/members')
  .all(requireAuth)
  .get((req, res, next) => {
    const { householdId } = req.params;
  
    return HouseholdsService.getAllMembers(
      req.app.get('db'),
      householdId
    )
      .then(tasks => {
        return res.json(tasks)
      })
      .catch(next);
  })
  .post(jsonBodyParser, async (req, res, next) => {
    const { password, username, name, } = req.body
    const user_id = req.user.id
    const { householdId } = req.params;
    console.log(password, username, name)

    for (const field of ['name', 'username', 'password'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        })

    try {
      // const passwordError = MembersService.validatePassword(password)

      // if (passwordError)
      //   return res.status(400).json({ error: passwordError })

      const hasMemberwithMemberName = await HouseholdsService.hasMemberwithMemberName(
        req.app.get('db'),
        username
      )

      if (hasMemberwithMemberName)
        return res.status(400).json({ error: `Username already taken` })

      const hashedPassword = await  HouseholdsService.hashPassword(password)

      const newMember = {
        username,
        password: hashedPassword,
        name,
        household_id: householdId,
        user_id,
      }

      const member = await HouseholdsService.insertMember(
        req.app.get('db'),
        newMember
      )

      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${member.id}`))
        .json(HouseholdsService.serializeMember(member))
    } catch(error) {
      next(error)
    }
  })

  //delete household? 

  //Update household? 

module.exports = householdsRouter;