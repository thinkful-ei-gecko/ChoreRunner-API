const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

/* TODO:
 - POST households
    - Valid post data
    - Invalid post data
    - Malicious XSS
 - UPDATE households
    - Valid post update data
    - Invalid post update data
    - Malicious XSS
 - DELETE household --- UNNEEDED
*/

describe('Households Endpoints', function () {
  let db;

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

  describe(`GET api/households`, () => {

    context(`Given no households`, () => {

      before('seed users', () => helpers.seedUsers(db, testUsers));
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

      afterEach('cleanup', () => helpers.cleanTables(db));

      it(`responds with 200 and an array with all the households`, () => {
        const expectedHouseholds = testHouseholds.map(household =>
          helpers.makeExpectedHousehold(testUsers, household)
        );
        return supertest(app)
          .get('/api/households')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedHouseholds);
      });
    });

    context(`Given an XSS attack household`, () => {
      const testUser = helpers.makeUsersArray()[1];
      const {
        maliciousHousehold,
        expectedHousehold,
      } = helpers.makeMaliciousHousehold(testUser);

      beforeEach('insert malicious household', () => {
        return helpers.seedMaliciousHousehold(
          db,
          testUser,
          maliciousHousehold,
        );
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/households`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body[0].name).to.eql(expectedHousehold.name);
          });
      });
    });
  });

  describe(`GET /api/households`, () => {
    context(`Given no household`, () => {
      before('seed users', () => helpers.seedUsers(db, testUsers));
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

    context('Given there are households in the database', () => {
      beforeEach('insert households', () =>
        helpers.seedHouseholds(
          db,
          testUsers,
          testHouseholds,
        )
      );

      it('responds with 200 and all of the households', () => {
        const expectedhouseholds = testHouseholds.map(household =>
          helpers.makeExpectedHousehold(
            testUsers,
            household,
          )
        );
        return supertest(app)
          .get('/api/households')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedhouseholds);
      });
    });

    context(`Given an XSS attack household`, () => {
      const testUser = helpers.makeUsersArray()[1];
      const {
        maliciousHousehold,
        expectedHousehold,
      } = helpers.makeMaliciousHousehold(testUser);

      beforeEach('insert malicious household', () => {
        return helpers.seedMaliciousHousehold(
          db,
          testUser,
          maliciousHousehold,
        );
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/households`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body[0].name).to.eql(expectedHousehold.name);
          });
      });
    });
  });

      //Alex: I am removing this test because this endpoint doesn't seem to be utilized by this app.


  // describe(`GET /api/households/:id`, () => {
  //   context(`Given no household`, () => {
  //     beforeEach(() =>
  //       helpers.seedUsers(db, testUsers)
  //     )
  //     it(`responds with 404`, () => {
  //       const householdId = 123456
  //       return supertest(app)
  //         .get(`/api/households/${householdId}`)
  //         .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
  //         .expect(404, { error: `Household doesn't exist` })
  //     })
  //   })

    //seed testTasks later
    // context('Given there are households in the database', () => {
    //   beforeEach('insert household', () =>
    //     helpers.seedChoresTables(
    //       db,
    //       testUsers,
    //       testHouseholds,
    //     )
    //   )
    //seed testTasks later
    // it('responds with 200 and the specified household', () => {
    //   const householdId = 1
    //   const expectedHousehold = helpers.makeExpectedHousehold(
    //     testUsers,
    //     testHouseholds[householdId - 1],
    //   )

    //   return supertest(app)
    //     .get(`/api/households/${householdId}`)
    //     .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
    //     .expect(200, expectedHousehold)
    // })
    // })


    // context(`Given an XSS attack household`, () => {
    //   const {
    //     maliciousHousehold,
    //     expectedHousehold,
    //   } = helpers.makeMaliciousHousehold(testUser);

    //   beforeEach('insert malicious household', () => {
    //     console.log(testUser);
    //     return helpers.seedMaliciousHousehold(
    //       db,
    //       testUsers[0],
    //       maliciousHousehold,
    //     )
    //   })

      
      // it.only('removes XSS attack content', () => {
      //   console.log('The id: ', maliciousHousehold.id);
      //   return supertest(app)
      //     .get(`/api/households/${maliciousHousehold.id}`)
      //     .set('Authorization', helpers.makeAuthHeader(testUser))
      //     .expect(200)
      //     .expect(res => {
      //       console.log('Response body: ', res.body);
      //       expect(res.body.name).to.eql(expectedHousehold.name)
      //     })
      // })
    // });
  // })
});
