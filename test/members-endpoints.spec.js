const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only(`Members Endpoints`, () => {

  let db;

  const {
    testUsers,
    testHouseholds,
    testMembers,
  } = helpers.makeFixtures();

  const testUser = testUsers[0],
    testHousehold = testHouseholds[0];

  console.log(testUser);
  before(`make knex instance`, () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe(`GET api/households/:householdId/members`, () => {

    context(`Households do not have members`, () => {
      beforeEach('insert households', () => {
        helpers.seedChoresTables(
          db,
          testUsers,
          testHouseholds
        );
      });

      it(`returns with a 200 status and an empty array`, () => {
        return supertest(app)
          .get(`/api/households/${testHousehold.id}/members`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, []);
      });
    });

    context(`Households have some members`, () => {
      beforeEach('insert households', () => {
        helpers.seedChoresTables(
          db,
          testUsers,
          testHouseholds,
          testMembers
        );
      });

      it(`returns with a 200 status and an array with all members of household`, () => {
        const expectedMembers = [];
        return supertest(app)
          .get(`/api/households/${testHousehold.id}/members`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedMembers);
      });
    });

  });

});