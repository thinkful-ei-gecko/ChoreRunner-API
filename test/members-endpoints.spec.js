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

describe(`Members Endpoints`, () => {
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


  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  const {
    testUsers,
    testHouseholds,
    testMembers,
    testTasks,
  } = helpers.makeFixtures();

  const testUser = testUsers[0];
  const testMember = testMembers[0];
  const testHousehold = testHouseholds[0];

  describe('GET api/households/:householdId/members', () => {
    context('Households do not have members', () => {
      beforeEach('insert households but not members', () => {
        helpers.seedHouseholds(db, testUsers, testHouseholds);
      });

      it('returns with a 200 status and an empty array', () => {
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

      it('returns with a 200 status and an array with all members of household', () => {
        const expectedMembers = testMembers;
        return supertest(app)
          .get(`/api/households/${testHousehold.id}/members`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedMembers);
      });
    });

    context('Given an XSS attack member name or username', () => {
      const { maliciousMember, expectedMember } = helpers.makeMaliciousMember();
      beforeEach('insert malicious member', () => {
        helpers.seedHouseholds(db, testUsers, testHouseholds)
          .then(() => {
            return db
              .into('members')
              .insert([ maliciousMember ]);
          });
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/households/${testHousehold.id}/members`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body[0].name).to.eql(expectedMember.name);
            expect(res.body[0].username).to.eql(expectedMember.username);
          });
      });

    });
  });

  describe('POST api/households/:householdId/members', () => {
    beforeEach('insert users and households', () => {
      helpers.seedHouseholds(db, testUsers, testHouseholds);  
    });

    it('creates a member, responding with 201 and the new member', () => {
      const newMember = {
        name: 'test name',
        username: 'test username',
        password: 'password',
      };

      return supertest(app)
        .post(`/api/households/${testHousehold.id}/members`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(newMember)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(newMember.name);
          expect(res.body.username).to.eql(newMember.username);
          expect(res.body.user_id).to.eql(newMember.user_id);
        });
    });

    
    it.only('removes XSS attack content when posting a member', () => {
      const { maliciousMember, expectedMember } = helpers.makeMaliciousMember();
      return supertest(app)
        .post(`/api/households/${testHousehold.id}/members`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(maliciousMember)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(expectedMember.name);
          expect(res.body.username).to.eql(expectedMember.username);
        });
    });

  });
});
