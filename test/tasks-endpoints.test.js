const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

/* TODO:
 - GET tasks
    - When tasks aren't in db
    - When tasks are in db
 - POST tasks
    - Valid post data
    - Invalid post data
    - Malicious XSS
 - UPDATE members
    - Valid post update data
    - Invalid post update data
    - Malicious XSS
 - DELETE tasks
    
*/

describe('Tasks Endpoints', function () {
  let db

  const {
    testUsers,
    testHouseholds,
    testMembers,
    testTasks
  } = helpers.makeFixtures();

  const testUser = testUsers[0];
  const testMember = testMembers[0];
  const testHousehold = testHouseholds[0];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  before('cleanup', () => helpers.cleanTables(db));
  afterEach('cleanup', () => helpers.cleanTables(db));
  after('disconnect from db', () => db.destroy());

  describe(`GET api/households/:householdId/tasks`, () => {
    before('seed users', () => helpers.seedUsers(db, testUsers));
    //logic here
  });

}); //End describe('Tasks Endpoints')