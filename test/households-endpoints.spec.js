const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Households Endpoints', function () {
  let db

  const {
    testUsers,
    testHouseholds,
    testMembers,
    testTasks
  } = helpers.makeFixtures();

  const testUser = testUsers[0];

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
        helpers.seedChoresTables(
          db,
          testUsers,
          testHouseholds
        );
      });
      
      afterEach('cleanup', () => helpers.cleanTables(db));

      it(`responds with 200 and an array with all the households`, () => {
        const expectedHouseholds = testHouseholds.map(household =>
          helpers.makeExpectedHousehold(testUsers, household)
        );
        return supertest(app)
          .get('/api/households')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedHouseholds);
      })
    });

    context.skip(`Given an XSS attack household`, () => {
      const testUser = helpers.makeUsersArray()[1]
      const {
        maliciousHousehold,
        expectedHousehold,
      } = helpers.makeMaliciousHousehold(testUser)

      beforeEach('insert malicious household', () => {
        return helpers.seedMaliciousHousehold(
          db,
          testUser,
          maliciousHousehold,
        )
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/households`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body[0].name).to.eql(expectedHousehold.name)
          })
      })
    })
  });

  describe(`GET /api/households`, () => {
    context(`Given no household`, () => {
      before('seed users', () => helpers.seedUsers(db, testUsers))
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/households')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .then(res => {
            expect(res.body).to.be.an('array');
            expect(res.body).to.eql([])
          })
      })
    })

    // Seed tasks and members table when ready
    context('Given there are households in the database', () => {
      beforeEach('insert households', () =>
        helpers.seedChoresTables(
          db,
          testUsers,
          testHouseholds,
        )
      )

      it('responds with 200 and all of the households', () => {
        const expectedhouseholds = testHouseholds.map(household =>
          helpers.makeExpectedHousehold(
            testUsers,
            household,
          )
        )
        return supertest(app)
          .get('/api/households')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedhouseholds)
      })
    })

    context.only(`Given an XSS attack household`, () => {
      const testUser = helpers.makeUsersArray()[1]
      const {
        maliciousHousehold,
        expectedHousehold,
      } = helpers.makeMaliciousHousehold(testUser)

      beforeEach('insert malicious household', () => {
        return helpers.seedMaliciousHousehold(
          db,
          testUser,
          maliciousHousehold,
        )
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/households`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body[0].name).to.eql(expectedHousehold.name)
          })
      })
    })
  })

});
