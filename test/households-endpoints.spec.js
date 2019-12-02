const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Households Endpoints', function () {
  let db

  const {
    testUsers,
    testHouseholds,
    testMembers,
    testTasks
  } = helpers.makeFixtures();

  const testUser = testUsers[0];

  before('make knex instance', () => {
    console.log(process.env.TEST_DATABASE_URL);
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  afterEach('cleanup', () => helpers.cleanTables(db));

  after('disconnect from db', () => db.destroy());
  before('cleanup', () => helpers.cleanTables(db));

  describe(`GET api/households`, () => {
    before('seed users', () => helpers.seedUsers(db, testUsers));
    context(`Given no households`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/households')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .then(res => {
            expect(res.body).to.be.an('array');
            expect(res.body).to.eql([]);
          });
      });
    });
    context(`Given households exist`, () => {
      beforeEach('insert households', () => {
        helpers.seedHouseholds(
          db,
          testUsers,
          testHouseholds
        );
      });
    });
  });

});