const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUser(id, name, username, password) {
  return {
    id,
    name,
    username,
    password
  }
}

function makeUsersArray(num) {
  let arr = []
  for (let i = 0; i < num; i++) {
    arr = [...arr, makeUser(i, `test-user-${i}`, `test-username-${i}`, 'Password123!')]
  }
  return arr
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('blogful_users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('blogful_users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        users
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
  makeUser,
  makeUsersArray,
  seedUsers,
  cleanTables,
  makeAuthHeader,
  makeFixtures
}