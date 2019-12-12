const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

/* TODO:
 - GET tasks
    - When tasks aren't in db
    - When tasks are in db
    - Malicious XSS
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

//Moved logic for task testing here.

describe('POST /api/households/:householdId/tasks', () => {
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
        .expect(400, { error: { message: 'Missing task name, member id or points in request body' } })
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
        .expect(400, { error: { message: 'Missing task name, member id or points in request body' } })
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
        .expect(400, { error: { message: 'Missing task name, member id or points in request body' } })
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
