const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

//  TODO:
//  - GET members --Yulia
//     - When members aren't in db
//     - When member are in db
//     - XSS attack
//  - POST members --Yulia
//     - Valid post data
//     - Invalid post data
//     - Malicious XSS
//  - UPDATE members- Hubert
//     - Valid post update data
//     - Invalid post update data
//     - Malicious XSS
//  - DELETE members --Daniel
//     - When member exists
//     - When member doesn't exist

//  - *BONUS A member's total score increases by a task's point value when they complete
//     a given task. --Daniel

//  - *BONUS A member gains a level when they accumulate enough points. --Daniel

describe.only(`Members Endpoints`, () => {
  let db;

  const {
    testUsers,
    testHouseholds,
    testMembers,
    testTasks,
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
  afterEach('cleanup', () => {
    console.log('Cleanup firing, calling helper...');
    helpers.cleanTables(db).then(() => console.log('Cleanup done, finishing!'));
  });
  after('disconnect from db', () => db.destroy());

  describe(`GET api/households/:householdId/members`, () => {
    context(`Households do not have members`, () => {
      before('insert households but not members', () => {
        helpers.seedHouseholds(db, testUsers, testHouseholds);
      });

      it(`returns with a 200 status and an empty array`, () => {
        return supertest(app)
          .get(`/api/households/${testHousehold.id}/members`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, []);
      });
    });

    context(`Households have some members`, () => {
      before('insert households and members', () => {
        helpers
          .seedHouseholds(db, testUsers, testHouseholds)
          .then(() => helpers.seedMembers(db, testMembers));
      });

      it(`returns with a 200 status and an array with all members of household`, () => {
        const expectedMembers = testMembers;
        return supertest(app)
          .get(`/api/households/${testHousehold.id}/members`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedMembers);
      });
    });
  });
});
