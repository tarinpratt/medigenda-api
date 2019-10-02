const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const jwt = require('jsonwebtoken')


describe.only('MedLog Endpoints', function() {
    let db 

    const {
        testUsers,
        testMedLog,
        testUpcomingAppts
    } = helpers.makeFixtures()

      function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
       const token = jwt.sign({user_id: user.id}, secret, {
           subject: user.username,
           algorithm: 'HS256',
       })
       return `Bearer ${token}`
     }

    before('make knex instance', () => {
        db = knex({
          client: 'pg',
          connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
      })
       after('disconnect from db', () => db.destroy())

       before('clean the table', () => helpers.cleanTables(db))

       afterEach('cleanup', () => helpers.cleanTables(db))

describe(`Protected Endpoints`, () => {
    const protectedEndpoints = [
        {
            name: 'GET /api/medlog',
            path: '/api/medlog'
        },
        {
            name: 'GET /api/medlog/:medlog_id',
            path: '/api/medlog/1'
        },
        {
            name:'POST /api/medlog',
            path: '/api/medlog'
        },
        {
            name: `DELETE /api/medlog/:medlog_id`,
            path: '/api/medlog/1'
        },
        {
            name: `PATCH /api/medlog/:medlog_id`,
            path: '/api/medlog/1'
        }
    ]
    protectedEndpoints.forEach(endpoint => { 
    describe(endpoint.name, () => {
        it(`responds w 401 'missing bearer token when no basic token`,() => {
            return supertest(app)
                .get(endpoint.path)
                .expect(401, {
                    error: `Missing bearer token`
                })   
        })
        it(`responds 401 'unauthorized request' when invalid JWT secret`, () => {
            
            const validUser = testUsers[0]
            const invalidSecret = 'bad-secret'
            return supertest(app)
                .get(endpoint.path)
                .set('Authorization', makeAuthHeader(validUser, invalidSecret))
                .expect(401, { error: `Unauthorized request` })
        })
        it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
            const invalidUser = { username: 'user-not-existy', id: 1 }
            return supertest(app)
                  .get(endpoint.path)
                  .set('Authorization', makeAuthHeader(invalidUser))
                  .expect(401, { error: `Unauthorized request` })
              })
    })
})

       describe(`GET /api/medlog`, () => {
        context(`given no medlog entries`, () => {
            beforeEach('insert entries', () => 
            helpers.seedUsers(
                db,
                testUsers,
            )
        )
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                .get(`/api/medlog`)
                .set('Authorization', makeAuthHeader(testUsers[0]))
                .expect(200, [])
            })
        })

        context(`given there are medlog entries in the db`, () => {
            beforeEach('insert entries', () => 
                helpers.seedTable(
                    db,
                    testUsers,
                    testMedLog,
                    testUpcomingAppts
                )
            )
              
             it(`responds w 200 and all of the med log entries`, () => {
                const expectedEntries = testMedLog.map(entry =>
                    helpers.MakeExpectedEntry(
                      testUsers,
                      entry
                    )
                  )
                 
                 return supertest(app)
                   .get('/api/medlog')
                   .set('Authorization', makeAuthHeader(testUsers[0]))
                   .expect(200, expectedEntries) 
             })
        })

    })

    describe(`GET /api/medlog/:medlog_id`, () => {
        context('Given there are medlog entries in the database', () => {
                const testUser = testUsers[0]
                context(`Given an XSS attack entry`, () => {
                    const maliciousEntry = {
                        id: 911,
                        date: '2019-08-11T00:00:00.000Z',
                        time: '06:06:00',
                        medname: 'Naughty naughty very naughty <script>alert("xss");</script>',
                        amounttaken: '7 pills',
                        reason: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
                        user_id: testUser.id
                    }
                    beforeEach('insert malicious entry', () => {
                        return db
                            .into('medlog')
                            .insert([maliciousEntry])
                    })
                    it('removes XSS attack content', () => {
                        return supertest(app)
                            .get(`/api/medlog/${maliciousEntry.id}`)
                            .set('Authorization', makeAuthHeader(testUsers[0]))
                            .expect(200)
                            .expect(res => {
                                expect(res.body.date).to.eql('2019-08-11T00:00:00.000Z')
                                expect(res.body.time).to.eql('06:06:00')
                                expect(res.body.medname).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                                expect(res.body.amounttaken).to.eql('7 pills')
                                expect(res.body.reason).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
                                expect(res.body.user_id).to.eql(testUser.id)
                            })
                    })
                })
        
                beforeEach('insert entries', () => 
                helpers.seedTable(
                    db,
                    testUsers,
                    testMedLog,
                    testUpcomingAppts
                )
            )
          
          it('responds with 200 and the specified medlog entry', () => {
            const medlogId = 2
            const expectedEntry= testMedLog[medlogId - 1]
            return supertest(app)
              .get(`/api/medlog/${medlogId}`)
              .set('Authorization', makeAuthHeader(testUsers[0]))
              .expect(200, expectedEntry)
          })
        })
      })

      describe(`POST /api/medlog`, () => {
      beforeEach('insert entries', () => 
      helpers.seedUsers(
          db,
          testUsers,
      )
  )
          const testUser = testUsers[0]
          it(`creates an entry responding w 201 and the new entry`, () => {
              const newLog = {
                date: '2019-08-11T00:00:00.000Z',
                time: '09:35:00',
                medname: 'Promethazine',
                amounttaken: '1 pill',
                reason: 'Nausea',
              }

              return supertest(app)
                .post('/api/medlog')
                .set('Authorization', makeAuthHeader(testUsers[0]))
                .send(newLog)
                .expect(res => {
                    expect(res.body.date).to.eql(newLog.date)
                    expect(res.body.time).to.eql(newLog.time)
                    expect(res.body.medname).to.eql(newLog.medname)
                    expect(res.body.amounttaken).to.eql(newLog.amounttaken)
                    expect(res.body.reason).to.eql(newLog.reason)
                    expect(res.body.user_id).to.eql(testUser.id)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/medlog/${res.body.id}`)
                })
                .then(res => 
                        supertest(app)
                            .get(`/api/medlog/${res.body.id}`)
                            .set('Authorization', makeAuthHeader(testUsers[0]))
                            .expect(res.body)
                            )
          })

          const requiredFields = ['date', 'time', 'medname', 'amounttaken', 'reason']
          requiredFields.forEach(field => {
              const newEntry = {
                date: '2019-08-11T00:00:00.000Z',
                time: '09:35:00',
                medname: 'Promethazine',
                amounttaken: '1 pill',
                reason: 'Nausea'
              }
          
          it(`responds w 400 and an error message when the ${field} is missing `, () => {
              delete newEntry[field]

              return supertest(app)
                .post('/api/medlog')
                .set('Authorization', makeAuthHeader(testUsers[0]))
                .send(newEntry)
                .expect(400, {
                    error: { message: `Missing key and value in request body` }
                })
          })
      })
      context(`Given an XSS attack entry`, () => {
        const maliciousEntry = {
            id: 911,
            date: '2019-08-11T00:00:00.000Z',
            time: '06:06:00',
            medname: 'Naughty naughty very naughty <script>alert("xss");</script>',
            amounttaken: '7 pills',
            reason: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
            user_id: testUser.id
        }
        beforeEach('insert malicious entry', () => {
            return db
                .into('medlog')
                .insert([maliciousEntry])
        })
        it('removes XSS attack content', () => {
            return supertest(app)
                .get(`/api/medlog/${maliciousEntry.id}`)
                .set('Authorization', makeAuthHeader(testUsers[0]))
                .expect(200)
                .expect(res => {
                    expect(res.body.date).to.eql('2019-08-11T00:00:00.000Z')
                    expect(res.body.time).to.eql('06:06:00')
                    expect(res.body.medname).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                    expect(res.body.amounttaken).to.eql('7 pills')
                    expect(res.body.reason).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
                    expect(res.body.user_id).to.eql(testUser.id)
                })
        })
    })

    })
      describe(`DELETE /api/medlog/:medlog_id`, () => {
          context(`Given no entries`, () => {
            beforeEach('insert entries', () =>
        helpers.seedUsers(
          db,
          testUsers,
        
        )
      )
              it(`responds with 404`, () => {
                  const entryId = 0000
                  return supertest(app)
                    .delete(`/api/medlog/${entryId}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .expect(404, { 
                        error: { message: `entry does not exist` }
                    })
              })
          })
          context('Given there are entries in the db', () => {
            beforeEach('insert entries', () =>
            helpers.seedTable(
              db,
              testUsers,
              testMedLog,
              testUpcomingAppts
            
            )
          )
              it('responds w 204 and removes the entry', () => {
                  const idToRemove = 2
                  const expectedEntries = testMedLog.filter(entry => entry.id !== idToRemove)
                  return supertest(app)
                    .delete(`/api/medlog/${idToRemove}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get('/api/medlog')
                            .expect(expectedEntries)
                    })
              })
          })

      })

      describe(`PATCH /api/medlog/:medlog_id`, () => {
          context(`Given no entries`, () => {
            beforeEach('insert entries', () =>
            helpers.seedUsers(
              db,
              testUsers,
            
            )
          )
              it(`responds w 404`, () => {
                  const entryId = 0000
                  return supertest(app)
                    .patch(`/api/medlog/${entryId}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .expect(404, { 
                        error: { message: `entry does not exist` }
                    })
              })

          })
        
                context('Given there are entries in the db', () => {
                    beforeEach('insert entries', () =>
            helpers.seedTable(
              db,
              testUsers,
              testMedLog,
              testUpcomingAppts
            
            )
          )
                    it('responds w 204 and updated entry', () => {
                        const testUser = testUsers[0]
                        const idToUpdate = 2
                        const updateEntry = {
                            date: '2019-08-05T00:00:00.000Z',
                            time: '10:35:00',
                            medname: 'updated entry medname',
                            amounttaken: 'updated entry amounttaken',
                            reason: 'updated entry reason',
                            user_id: testUser.id
                        }
                        const expectedEntry = {
                            ...testMedLog[idToUpdate - 1],
                            ...updateEntry
                        }
                        return supertest(app)
                            .patch(`/api/medlog/${idToUpdate}`)
                            .set('Authorization', makeAuthHeader(testUsers[0]))
                            .send(updateEntry)
                            .expect(204)
                            .then(res => 
                                supertest(app)
                                .get(`/api/medlog/${idToUpdate}`)
                                .set('Authorization', makeAuthHeader(testUsers[0]))
                                .expect(expectedEntry))
                    })

                    it(`responds w 400 when no required fields are supplied`, () => {
                        const idToUpdate = 2
                        return supertest(app)
                            .patch(`/api/medlog/${idToUpdate}`)
                            .set('Authorization', makeAuthHeader(testUsers[0]))
                            .send({ irrelevantField: 'foo'})
                            .expect(400, {
                                error: {message: `request body must contain date, time, medname, amounttaken, reason`}
                            })
                    })
                    it(`responds w 204 when updating only a subset of fields`, () => {
                        const idToUpdate = 2
                        const updateEntry = {
                            medname: 'updated entry medname',
                        }
                        const expectedEntry = {
                            ...testMedLog[idToUpdate - 1],
                            ...updateEntry
                        }
                        return supertest(app)
                            .patch(`/api/medlog/${idToUpdate}`)
                            .set('Authorization', makeAuthHeader(testUsers[0]))
                            .send({
                                ...updateEntry,
                                fieldToIgnore: 'should not be in GET response'
                            })
                            .expect(204)
                            .then(res => 
                                supertest(app)
                                .get(`/api/medlog/${idToUpdate}`)
                                .set('Authorization', makeAuthHeader(testUsers[0]))
                                .expect(expectedEntry)
                                )
                    })
                })
                

      })



})

})
