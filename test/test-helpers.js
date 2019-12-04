const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// function makeUser(id, name, username, password) {
//   return {
//     id,
//     name,
//     username,
//     password
//   }
// }

// function makeUsersArray(num = 4) {
//   let arr = []
//   for (let i = 0; i <= num; i++) {
//     arr = [...arr, makeUser(i, `test-user-${i}`, `test-username-${i}`, 'Password123!')]
//   }
//   return arr
// }

// function makeHousehold(id, name, user_id) {
//   return {
//     id,
//     name,
//     user_id
//   }
// }

// function makeHouseholdArray(user_id, num = 4) {
//   let arr = []
//   for (let i = 0; i <= num; i++) {
//     arr = [...arr, makeHousehold(i, )]
//   }
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

function makeHouseholdsArray() {
  return [
    {
      id: 1,
      name: 'household1',
      user_id: 1
    },
    {
      id: 2,
      name: 'household2',
      user_id: 1
    },
    {
      id: 3,
      name: 'household3',
      user_id: 1
    },
    {
      id: 4,
      name: 'household4',
      user_id: 1
    }
  ]
}

// Household members?
function makeMembersArray() {
  return [
    {
      id: 1,
      name: 'kid1',
      username: 'kid1',
      password: 'kid1',
      user_id: 1,
      household_id: 1
    },
    {
      id: 2,
      name: 'kid2',
      username: 'kid2',
      password: 'kid2',
      user_id: 1,
      household_id: 1
    },
    {
      id: 3,
      name: 'kid3',
      username: 'kid3',
      password: 'kid3',
      user_id: 1,
      household_id: 1
    },
    {
      id: 4,
      name: 'kid4',
      username: 'kid4',
      password: 'kid4',
      user_id: 1,
      household_id: 1
    },
  ]
}

function makeTasksArray() {
  return [
    {
      id: 1,
      title: 'task1',
      household_id: 1,
      user_id: 1,
      member_id: 1,
      points: 4
    },
    {
      id: 2,
      title: 'task2',
      household_id: 1,
      user_id: 1,
      member_id: 2,
      points: 3
    },
    {
      id: 3,
      title: 'task3',
      household_id: 1,
      user_id: 1,
      member_id: 3,
      points: 2
    },
    {
      id: 4,
      title: 'task4',
      household_id: 1,
      user_id: 1,
      member_id: 4,
      points: 1
    },
  ]
}

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

function makeExpectedHousehold(users, household) {
  const user = users.find(user => user.id === household.user_id);

  return {
    id: household.id,
    name: household.name,
    user_id: household.user_id
  }

}

function makeExpectedEntry(users, entry) {
  const user = users
    .find(user => user.id === entry.user_id)
  return {
    id: entry.id,
    title: entry.title,
    content: entry.content,
    duration: entry.duration,
    mood_type: entry.mood_type,
    date_created: entry.date_created,
    user: {
      id: user.id,
      user_name: user.user_name,
      full_name: user.full_name,
      nickname: user.nickname,
      date_created: user.date_created,
    },
  }
}

function seedChoresTables(db, users, households = [], members = [], tasks = []) {
  return db
    .transaction(async trx => {
      await seedUsers(trx, users)
      await trx.into('households').insert(households)
      await trx.raw(
        `SELECT setval('households_id_seq', ?)`,
        [households[households.length - 1].id],
      )
      // await trx.into('members').insert(members)
      // await trx.raw(
      //   `SELECT setval('members_id_seq', ?)`,
      //   [members[members.length - 1].id]
      // )
      // if (tasks.length) {
      //   await trx.into('tasks').insert(tasks);
      //   await trx.raw(`SELECT setval('tasks_id_seq', ?)`,
      //     [tasks[tasks.length - 1].id]
      //   )
      // }
    })
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        tasks,
        members,
        households,
        users
        RESTART IDENTITY CASCADE
      `
    )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('users_id_seq', 0)`),
        ])
      )
  )
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
  //TODO this relies on how the rest of the API is structured.
  const testHouseholds = makeHouseholdsArray(testUsers)
  const testMembers = makeMembersArray(testUsers, testHouseholds)
  const testTasks = makeTasksArray(testMembers)
  return { testUsers, testHouseholds, testMembers, testTasks }
}

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
  return seedUsers(db, [user])
    .then(() =>
      db
        .into('households')
        .insert([household])
    )
}

module.exports = {
  seedUsers,
  seedChoresTables,
  seedMaliciousHousehold,
  cleanTables,

  makeFixtures,
  makeMaliciousHousehold,
  makeUsersArray,
  makeHouseholdsArray,
  makeExpectedHousehold,
  // makeMembersArray,
  // makeTasksArray,
  makeAuthHeader
}