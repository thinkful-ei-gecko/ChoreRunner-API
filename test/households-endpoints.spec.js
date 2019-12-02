const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.skip('Households Endpoints', function() {
  let db

  const {
    testUsers,
    testHouseholds,
    testMembers,
    testTasks
  } = helpers.makeFixtures()

  const testUser = testUsers[0]

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  afterEach('cleanup', () => helpers.cleanTables(db))

  after('disconnect from db', () => db.destroy())
  before('cleanup', () => helpers.cleanTables(db))


  describe(`GET /api/households`, () => {
    context(`Given no households`, () => {
      before('seed users', () => helpers.seedUsers(db, testUsers))
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/entries')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .then(res => {
            expect(res.body).to.be.an('array');
            expect(res.body).to.eql([])
          })
      })
    })

    context('Given there are households in the database', () => {
      beforeEach('insert households', () =>
        helpers.seedChoresTables(
          db,
          testUsers,
          testHouseholds,
          testMembers,
          testTasks
        )
      )

      it('responds with 200 and all of the entries', () => {
        const expectedEntries = testHouseholds.map(household =>
          helpers.makeExpectedEntry(
            testUsers,
            household,
          )
        )
        return supertest(app)
          .get('/api/entries')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedEntries)
      })
    })

    context(`Given an XSS attack entry`, () => {
      const testUser = helpers.makeUsersArray()[1]
      const {
        maliciousEntry,
        expectedEntry,
      } = helpers.makeMaliciousEntry(testUser)

      beforeEach('insert malicious entry', () => {
        return helpers.seedMaliciousEntry(
          db,
          testUser,
          maliciousEntry,
        )
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/entries`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body[0].title).to.eql(expectedEntry.title)
            expect(res.body[0].content).to.eql(expectedEntry.content)
          })
      })
    })
  })

  describe(`GET /api/entries/:entry_id`, () => {
    context(`Given no entries`, () => {
      beforeEach(() => 
        helpers.seedUsers(db, testUsers)
      )
      it(`responds with 404`, () => {
        const entryId = 123456
        return supertest(app)
          .get(`/api/entries/${entryId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Entry doesn't exist` })
      })
    })

    context('Given there are entries in the database', () => {
      beforeEach('insert entries', () =>
        helpers.seedEntriesTables(
          db,
          testUsers,
          testEntries,
          testComments,
        )
      )

      it('responds with 200 and the specified entry', () => {
        const entryId = 2
        const expectedEntry = helpers.makeExpectedEntry(
          testUsers,
          testEntries[entryId - 1],
          testComments,
        )

        return supertest(app)
          .get(`/api/entries/${entryId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedEntry)
      })
    })

    context(`Given an XSS attack entry`, () => {
      const testUser = helpers.makeUsersArray()[1]
      const {
        maliciousEntry,
        expectedEntry,
      } = helpers.makeMaliciousEntry(testUser)

      beforeEach('insert malicious entry', () => {
        return helpers.seedMaliciousEntry(
          db,
          testUser,
          maliciousEntry,
        )
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/entries/${maliciousEntry.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedEntry.title)
            expect(res.body.content).to.eql(expectedEntry.content)
          })
      })
    })
  })

  describe(`GET /api/entries/:entry_id/comments`, () => {
    context(`Given no entries`, () => {
      beforeEach(() => 
        helpers.seedUsers(db, testUsers)
      )
      it(`responds with 404`, () => {
        const entryId = 123456
        return supertest(app)
          .get(`/api/entries/${entryId}/comments`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Entry doesn't exist` })
      })
    })

    context('Given there are comments for entries in the database', () => {
      beforeEach('insert entries', () =>
        helpers.seedEntriesTables(
          db,
          testUsers,
          testEntries,
          testComments,
        )
      )

      it('responds with 200 and the specified comments', () => {
        const entryId = 1
        const expectedComments = helpers.makeExpectedEntryComments(
          testUsers, entryId, testComments
        )
        return supertest(app)
          .get(`/api/entries/${entryId}/comments`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedComments)
      })
    })
  })
})