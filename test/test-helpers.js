const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


// function makeUsersArray(num = 4) {
//   let arr = []
//   for (let i = 0; i <= num; i++) {
//     arr = [
//       ...arr,
//       {
//         id: i,
//         name: `test-user-${i}`,
//         username: `test-username-${i}`,
//         password: 'Password123!'
//       }
//     ]
//   }
//   return arr
// }

function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'test-user-1',
      password: 'password',
      name: 'Test user 1',
    },
    {
      id: 2,
      username: 'test-user-2',
      password: 'password',
      name: 'Test user 2',
    },
    {
      id: 3,
      username: 'test-user-3',
      password: 'password',
      name: 'Test user 3',
    },
    {
      id: 4,
      username: 'test-user-4',
      password: 'password',
      name: 'Test user 4',
    },
  ]
}

function makeHouseholdsArray(users) {
  return [
    {
      id: 1,
      name: 'household1',
      user_id: users[0].id
    },
    {
      id: 2,
      name: 'household2',
      user_id: users[0].id
    },
    {
      id: 3,
      name: 'household3',
      user_id: users[0].id
    },
    {
      id: 4,
      name: 'household4',
      user_id: users[0].id
    }
  ]
}

function makeMembersArray() {
  return [
    {
      id: 1,
      name: 'kid1',
      username: 'kid1',
      password: 'kid1',
      user_id: 1,
      household_id: 1,
      total_score: 20
    },
    {
      id: 2,
      name: 'kid2',
      username: 'kid2',
      password: 'kid2',
      user_id: 1,
      household_id: 1,
      total_score: 5
    },
    {
      id: 3,
      name: 'kid3',
      username: 'kid3',
      password: 'kid3',
      user_id: 1,
      household_id: 1,
      total_score: 30
    },
    {
      id: 4,
      name: 'kid4',
      username: 'kid4',
      password: 'kid4',
      user_id: 1,
      household_id: 1,
      total_score: 0
    },
  ];
}

function makeTasksArray() {
  return [
    {
      id: 1,
      title: 'task1',
      household_id: 1,
      user_id: 1,
      member_id: 1,
      points: 4,
      status: 'assigned'
    },
    {
      id: 2,
      title: 'task2',
      household_id: 1,
      user_id: 1,
      member_id: 2,
      points: 3,
      status: 'assigned'
    },
    {
      id: 3,
      title: 'task3',
      household_id: 1,
      user_id: 1,
      member_id: 3,
      points: 2,
      status: 'completed'
    },
    {
      id: 4,
      title: 'task4',
      household_id: 1,
      user_id: 1,
      member_id: 4,
      points: 1,
      status: 'approved'
    },
  ]
}


function makeExpectedHousehold(users, household) {
  const user = users.find(user => user.id === household.user_id);

  return {
    id: household.id,
    name: household.name,
    user_id: household.user_id
  }

}

function makeExpectedHouseholdTask(users, householdId, tasks) {
  const expectedTasks = tasks
    .filter(task => task.id === householdId)

  return expectedTasks.map(task => {
    const userTask = users.find(user => user.id === task.user_id);
    return {
      id: task.id,
      title: task.title,
      household_id: task.household_id,
      user_id: task.user_id,
      member_id: task.member_id,
      points: task.points,
      status: task.status
    }
  })
}

/* -- Seeding -- */

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))

  return db.into('users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

function seedHouseholds(db, users, households) {
  return db
    .transaction(async trx => {
      await seedUsers(trx, users)
      await trx.into('households').insert(households)
      await trx.raw(`SELECT setval('households_id_seq', ?)`,
        [households[households.length - 1].id],
      );
    });
}

function seedMembers(db, users, households, members) {
  return db
    .transaction(async trx => {
      await seedUsers(trx, users)
      await seedHouseholds(trx, users, households)
      await trx.into('members').insert(members)
      await trx.raw(
        `SELECT setval('members_id_seq', ?)`,
        [members[members.length - 1].id]
      )
    })
}

function seedTasks(db, users, households, members, tasks) {
  return db
    .transaction(async trx => {
      await seedUsers(trx, users)
      await seedHouseholds(trx, users, households)
      await seedMembers(trx, users, households, members)
      await trx.into('tasks').insert(tasks);
      await trx.raw(`SELECT setval('tasks_id_seq', ?)`,
        [tasks[tasks.length - 1].id]
      )
    })
}

//This was having trouble seeding the tables when missing params
function seedChoresTables(db, users, households, members, tasks) {
  return db
    .transaction(async trx => {
      await seedUsers(trx, users)
      await trx.into('households').insert(households)
      await trx.raw(
        `SELECT setval('households_id_seq', ?)`,
        [households[households.length - 1].id],
      )
      await trx.into('members').insert(members)
      await trx.raw(
        `SELECT setval('members_id_seq', ?)`,
        [members[members.length - 1].id]
      )
      await trx.into('tasks').insert(tasks);
      await trx.raw(`SELECT setval('tasks_id_seq', ?)`,
        [tasks[tasks.length - 1].id]
      )
    })
}

function cleanTables(db) {
  // console.log('starting cleanup')
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        levels,
        tasks,
        members,
        households,
        users
        RESTART IDENTITY CASCADE
      `
    )
    // .then(() => {
    //   console.log('finished cleaning up')
    //   // Promise.all([
    //   //   trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
    //   //   trx.raw(`SELECT setval('users_id_seq', 0)`),
    //   // ])
    // })
  );
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}


function makeFixtures() {
  const testUsers = makeUsersArray()
  const testHouseholds = makeHouseholdsArray(testUsers)
  const testMembers = makeMembersArray(testUsers, testHouseholds)
  const testTasks = makeTasksArray(testMembers)
  return { testUsers, testHouseholds, testMembers, testTasks }
}

/* ---XSS test helpers---*/

function makeMaliciousHousehold(user) {
  return {
    maliciousHousehold: {
      id: 1,
      name: 'A Foul Name <script>alert("xss");</script>',
      user_id: user.id
    },
    expectedHousehold: {
      id: 1,
      name: 'A Foul Name &lt;script&gt;alert("xss");&lt;/script&gt;',
      user_id: user.id
    }
  };
}

function seedMaliciousHousehold(db, user, household) {
  return this.seedHouseholds(db, [user], [household]);
}

//Creates a malicious task and its expected outcome.
function makeMaliciousTask(user, household, member) {

  const mockTask = {
    id: 1,
    title: null,
    household_id: household.id,
    user_id: user.id,
    member_id: member.id,
    points: 10,
    status: 'assigned'
  },
    maliciousString = 'A Foul Name <script>alert("xss");</script>',
    expectedString = 'A Foul Name &lt;script&gt;alert("xss");&lt;/script&gt;';

  return {
    maliciousTask: { ...mockTask, title: maliciousString },
    expectedTask: { ...mockTask }
  };
}

function seedMaliciousTask(db, user, household, task) {
  return seedChoresTables(db, [user], [household], [task])
}

module.exports = {
  cleanTables,
  seedUsers,
  seedHouseholds,
  seedMembers,
  seedTasks,
  seedChoresTables,
  seedMaliciousHousehold,
  seedMaliciousTask,

  makeMaliciousHousehold,
  makeMaliciousTask,
  makeUsersArray,
  makeHouseholdsArray,
  makeMembersArray,
  makeTasksArray,
  makeFixtures,

  makeExpectedHousehold,
  makeExpectedHouseholdTask,
  makeAuthHeader
}


//These null constants are for remembering/checking/using the structure of these objects.
//For example, if you write out 'nullUser' and hover over it while holding down ctrl,
// you can see the structure of the user object. These should be deleted when we complete
// this unless you find a use for them.

const nullUser = {
  id: null,
  name: null,
  username: null,
  password: null
},
  nullHousehold = {
    id: null,
    name: null,
    user_id: null
  },
  nullMember = {
    id: null,
    name: null,
    username: null,
    password: null,
    user_id: null,
    household_id: null,
    total_score: null
  },
  nullTask = {
    id: null,
    title: null,
    household_id: null,
    user_id: null,
    member_id: null,
    points: null,
    status: 'assigned'
  };