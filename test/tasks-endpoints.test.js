const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

/* TODO:
 - GET tasks
    - When tasks aren't in db
    - When tasks are in db
    - Malicious XSS

 - UPDATE members
    - Valid post update data
    - Invalid post update data
    - Malicious XSS
 - DELETE tasks
*/

//Moved logic for task testing here.

describe.only('Tasks Endpoints', () => {
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
  const testTask = testTasks[0];

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

  describe('GET /api/households/:householdId/tasks', () => {

    context.only('No tasks for a member', () => {
      beforeEach('insert members but no chores', () => {
        return helpers.seedChoresTables(
          db,
          testUsers,
          testHouseholds,
          testMembers
        );
      });

      it('responds with a 204 and an empty array', () => {
        console.log(testHousehold);

        return supertest(app)
          .get(`/api/households/${testHousehold.id}/tasks`)
          .set('Authorization', helpers.makeAuthHeader(testMember[0]))
          .expect(200, [])
          .end();
      });

    });

    context('Some tasks for a member', () => {
      beforeEach('insert members but no chores', () => {
        return helpers.seedChoresTables(
          db,
          testUsers,
          testHouseholds,
          testMembers,
          testTasks
        );
      });

      it('responds with a 201 and an empty array', () => {
        return supertest(app)
          .get(`/api/households/${testHousehold.id}/tasks`)
          .set('Authorization', helpers.makeAuthHeader(testMember[0]))
          .expect(201, [])
          .end();
      });
    });

  });

  describe('POST /api/households/:householdId/tasks', () => {

    beforeEach('insert members', () => {
      return helpers.seedChoresTables(
        db,
        testUsers,
        testHouseholds,
        testMembers,
      );
    });

    context(`Given when one request body is missing`, () => {

      it(`responds with 400 'Missing task name, member id or points in request body' when title missing`, () => {
        const tasksMissingTitle = {
          member_id: 1,
          points: 5
        };
        return supertest(app)
          .post('/api/households/:id/tasks')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(tasksMissingTitle)
          .expect(400, { error: { message: 'Missing task name, member id or points in request body' } });
      });

      it(`responds with 400 'Missing task name, member id or points in request body' when member_id missing`, () => {
        const tasksMissingMember = {
          title: 'title',
          points: 5
        };
        return supertest(app)
          .post('/api/households/:id/tasks')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(tasksMissingMember)
          .expect(400, { error: { message: 'Missing task name, member id or points in request body' } });
      });

      it(`responds with 400 'Missing task name, member id or points in request body' when points missing`, () => {
        const tasksMissingPoints = {
          member_id: 1,
          title: 'title'
        };
        return supertest(app)
          .post('/api/households/:id/tasks')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(tasksMissingPoints)
          .expect(400, { error: { message: 'Missing task name, member id or points in request body' } });
      });
    });


    context(`Given when we have correct values in req.body`, () => {

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
          });
      });

      it('filters XSS content', () => {
        const {
          maliciousTask,
          expectedTask,
        } = helpers.makeMaliciousTask(testUser, testHousehold, testMember);

        return supertest(app)
          .post(`/api/households/${testHousehold.id}/tasks`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(maliciousTask)
          .expect(201)
          .expect(res => {
            expect(res.body.title).to.eql(maliciousTask.title);
            expect(res.body.member_id).to.eql(maliciousTask.member_id);
            expect(res.body.points).to.eql(maliciousTask.points);
            expect(res.body).to.have.property('id');
            expect(res.headers.location).to.eql(`/api/households/${testHousehold.id}/tasks`);
          });
      });
    });
  });
});

// AssertionError: expected undefined to deeply equal(maliciousTask.title)
// context.only(`Given an XSS attack on household task`, () => {

//   const {
//     maliciousTask,
//     expectedTask,
//   } = helpers.makeMaliciousTask(testUser, testHousehold, testMember);

//   // delete maliciousTask.id;

//   before('insert malicious household task', () => {
//     return helpers.seedMaliciousTask(
//       db,
//       testUser,
//       testHousehold,
//       testMember,
//       maliciousTask,
//     );
//   });

//   //test removing id from task


//   it('removes XSS attack from title', () => {
//     console.log('Malicious ', maliciousTask.title)
//     console.log('Expected ', expectedTask.title)
//     return supertest(app)
//       .get(`/api/households/${maliciousTask.id}/tasks`)
//       .set('Authorization', helpers.makeAuthHeader(testUser))
//       .expect(200)
//       .expect(res => {
//         expect(res.body.title).to.eql(expectedTask.title)
//       })
//   })
// })