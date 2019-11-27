const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
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
  // const testHouseholds = makeHouseholdsArray(testUsers)
  // const testMembers = makeMembersArray(testUsers, testHouseholds)
  // const testTasks = makeTasksArray(testMembers)
  return { testUsers }
}

module.exports = {
  makeUsersArray,
  seedUsers,
  cleanTables,
  makeAuthHeader,
  makeFixtures
}