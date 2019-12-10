const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

/* TODO:
 - GET households
    - When households aren't in db
    - When households are in db
 - POST households
    - Valid post data
    - Invalid post data
    - Malicious XSS
 - UPDATE households
    - Valid post update data
    - Invalid post update data
    - Malicious XSS
 - DELETE household
*/

describe.only('Households Endpoints', function () {
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
      const testUser = helpers.makeUsersArray()[1];
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
        helpers.seedHouseholds(
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

    context(`Given an XSS attack household`, () => {
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

  describe(`GET /api/households/:id`, () => {
    context(`Given no household`, () => {
      beforeEach(() => 
        helpers.seedUsers(db, testUsers)
      )
      it(`responds with 404`, () => {
        const householdId = 123456
        return supertest(app)
          .get(`/api/households/${householdId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Household doesn't exist` })
      })
    })

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

    context(`Given an XSS attack household`, () => {
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
          .get(`/api/households/${maliciousHousehold.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body.name).to.eql(expectedHousehold.name)
          })
      })
    })
  })

  describe('POST /api/households/:householdId/tasks', () => {
    context(`Given when one request body is missing`, () => {
      beforeEach('insert chores', () => {
        return helpers.seedTasks(
          db,
          testUsers,
          testHouseholds,
          testMembers,
          testTasks
        )
      })
  
      it(`responds with 400 'Missing task name, member id or points in request body' when title missing`, () => {
        const tasksMissingTitle = {
          member_id: 1,
          points: 5
        };
        return supertest(app)
          .post('/api/households/:id/tasks')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(tasksMissingTitle)
          .expect(400, {error: { message: 'Missing task name, member id or points in request body'} })
      })
  
      it(`responds with 400 'Missing task name, member id or points in request body' when member_id missing`, () => {
        const tasksMissingMember = {
          title: 'title',
          points: 5
        };
        return supertest(app)
          .post('/api/households/:id/tasks')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(tasksMissingMember)
          .expect(400, {error: { message: 'Missing task name, member id or points in request body'} })
      })
  
      it(`responds with 400 'Missing task name, member id or points in request body' when points missing`, () => {
        const tasksMissingPoints = {
          member_id: 1,
          title: 'title'
        };
        return supertest(app)
          .post('/api/households/:id/tasks')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(tasksMissingPoints)
          .expect(400, {error: { message: 'Missing task name, member id or points in request body'} })
      })
    })
    
    context(`Given when we have correct values in req.body`, () => {
      beforeEach('insert chores', () => {
        return helpers.seedTasks(
          db,
          testUsers,
          testHouseholds,
          testMembers,
          testTasks
        )
      })

      it('responds with 201 when POSTs successfully', () => {
        const fullTaskBody = {
          title: 'test-title',
          member_id: 1,
          points: 5
        };
        const householdId = 1;
        return supertest(app)
          .post(`/api/households/${householdId}/tasks`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(fullTaskBody)
          .expect(201)
          .expect(res => {
            expect(res.body.title).to.eql(fullTaskBody.title);
            expect(res.body.member_id).to.eql(fullTaskBody.member_id);
            expect(res.body.points).to.eql(fullTaskBody.points);
            expect(res.body).to.have.property('id');
            expect(res.headers.location).to.eql(`/api/households/${householdId}/tasks`);
          })
      })
    })
    //AssertionError: expected undefined to deeply equal (maliciousTask.title)
    context(`Given an XSS attack on household task`, () => {

      const {
        maliciousTask,
        expectedTask,
      } = helpers.makeMaliciousTask(testUser, testHousehold, testMember);

      beforeEach('insert malicious household task', () => {
        return helpers.seedMaliciousTask(
          db,
          testUser,
          testHousehold,
          testMember,
          maliciousTask,
        );
      });

      it('removes XSS attack from title', () => {
        
        return supertest(app)
          .get(`/api/households/${maliciousTask.id}/tasks`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedTask.title)
          })
      })
    })
  })
});
