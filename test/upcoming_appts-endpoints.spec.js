const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const jwt = require('jsonwebtoken')

describe('upcoming_appts Endpoints', function() {
    let db 
    const { testUsers, testMedLog, testUpcomingAppts } = helpers.makeFixtures()

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
            name: 'GET /api/upcoming_appts',
            path: '/api/upcoming_appts'
        },
        {
            name: 'GET /api/upcoming_appts/:upcoming_appts_id',
            path: '/api/upcoming_appts/1'
        },
        {
            name:'POST /api/upcoming_appts',
            path: '/api/upcoming_appts'
        },
        {
            name: `DELETE /api/upcoming_appts/:upcoming_appts_id`,
            path: '/api/upcoming_appts/1'
        },
        {
            name: `PATCH /api/upcoming_appts/:upcoming_appts_id`,
            path: '/api/upcoming_appts/1'
        }
    ]
protectedEndpoints.forEach(endpoint => { 
describe(endpoint.name, () => {
    it(`responds w 401 'missing bearer token when no basic token`,() => {
        return supertest(app)
            .get(endpoint.path)
            .expect(401, { error: `Missing bearer token` })   
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
  

describe(`GET /api/upcoming_appts`, () => {
    context(`given no upcoming_appts appts`, () => {
        beforeEach('insert users', () => 
        helpers.seedUsers(
            db,
            testUsers
        )
    )
    it(`responds with 200 and an empty list`, () => {
        return supertest(app)
        .get(`/api/upcoming_appts`)
        .set('Authorization', makeAuthHeader(testUsers[0]))
        .expect(200, [])
        })
    })
  
    context(`given there are upcoming_appts appts in the db`, () => {
        beforeEach('insert entries', () => 
            helpers.seedTable(
                db,
                testUsers,
                testMedLog,
                testUpcomingAppts
        )
    ) 
    it(`responds w 200 and all of the appts`, () => {
        const expectedAppts = testUpcomingAppts.map(appt =>
        helpers.MakeExpectedAppt(
            testUsers,
            appt
        )
    )   
            return supertest(app)
            .get('/api/upcoming_appts')
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .expect(200, expectedAppts) 
        })
    })
})

describe(`GET /api/upcoming_appts/:upcoming_appts_id`, () => {
    context('Given there are upcoming_appts appts in the database', () => {
    const testUser = testUsers[0]
    context(`Given an XSS attack entry`, () => {
        const maliciousEntry = {
            id: 911,
            appt_date: '2019-08-11T00:00:00.000Z',
            appt_time: '06:06:00',
            appt_doctor: 'Naughty naughty very naughty <script>alert("xss");</script>',
            appt_location: 'Naughty naughty very naughty <script>alert("xss");</script>',
            appt_purpose: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
            appt_notes: 'Naughty naughty very naughty <script>alert("xss");</script>',
            copay: 3,
            doc_bill: 3,
            insurance_bill: 3,
            upcoming_appt: true,
            user_id: testUser.id       
        }
        beforeEach('insert malicious entry', () => {
            return db
                .into('upcoming_appts')
                .insert([maliciousEntry])
        })
    it('removes XSS attack content', () => {
        return supertest(app)
            .get(`/api/upcoming_appts/${maliciousEntry.id}`)
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .expect(200)
            .expect(res => {
                expect(res.body.appt_date).to.eql('2019-08-11T00:00:00.000Z')
                expect(res.body.appt_time).to.eql('06:06:00')
                expect(res.body.appt_doctor).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                expect(res.body.appt_location).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                expect(res.body.appt_purpose).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
                expect(res.body.appt_notes).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                expect(res.body.copay).to.eql('3')
                expect(res.body.doc_bill).to.eql('3')
                expect(res.body.insurance_bill).to.eql('3')
                expect(res.body.upcoming_appt).to.eql(true)
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
        it('responds with 200 and the specified upcoming_appts entry', () => {
        const upcoming_apptsId = 2
        const expectedAppt= testUpcomingAppts[upcoming_apptsId - 1]
        return supertest(app)
            .get(`/api/upcoming_appts/${upcoming_apptsId}`)
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .expect(200, expectedAppt)
        })
    })
})

describe(`POST /api/upcoming_appts`, () => {
    beforeEach('insert entries', () => 
    helpers.seedUsers(
        db,
        testUsers
    )
)
        const testUser = testUsers[0]
    it(`creates an entry responding w 201 and the new entry`, () => {
        const newAppt = {
        appt_date: '2019-09-20T00:00:00.000Z',
        appt_time: '09:35:00',
        appt_doctor: 'Dr.Suess',
        appt_location: 'Arizona Oncology',
        appt_purpose: `blood work`,
        appt_notes: 'ask about reactions from neulasta',
        copay: '3',
        doc_bill: '3',
        insurance_bill: '3',
        upcoming_appt: true
        }
        return supertest(app)
        .post('/api/upcoming_appts')
        .set('Authorization', makeAuthHeader(testUsers[0]))
        .send(newAppt)
        .expect(res => {
            expect(res.body.appt_date).to.eql(newAppt.appt_date)
            expect(res.body.appt_time).to.eql(newAppt.appt_time)
            expect(res.body.appt_doctor).to.eql(newAppt.appt_doctor)
            expect(res.body.appt_location).to.eql(newAppt.appt_location)
            expect(res.body.appt_purpose).to.eql(newAppt.appt_purpose)
            expect(res.body.appt_notes).to.eql(newAppt.appt_notes)
            expect(res.body.copay).to.eql(newAppt.copay)
            expect(res.body.doc_bill).to.eql(newAppt.doc_bill)
            expect(res.body.insurance_bill).to.eql(newAppt.insurance_bill)
            expect(res.body.upcoming_appt).to.eql(newAppt.upcoming_appt)
            expect(res.body.user_id).to.eql(testUser.id)
            expect(res.body).to.have.property('id')
            expect(res.headers.location).to.eql(`/api/upcoming_appts/${res.body.id}`)
        })
        .then(res => 
                supertest(app)
                    .get(`/api/upcoming_appts/${res.body.id}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .expect(res.body)
                    )
    })

    const requiredFields = ['appt_date', 'appt_time', 'appt_doctor', 'appt_location', 'appt_purpose', 'copay', 'doc_bill', 'insurance_bill', 'upcoming_appt']
    requiredFields.forEach(field => {
        const newAppt= {
        appt_date: '2019-09-20T00:00:00.000Z',
        appt_time: '09:35:00',
        appt_doctor: 'Dr.Suess',
        appt_location: 'Arizona Oncology',
        appt_purpose: `blood work`,
        appt_notes: 'test ask about reactions from neulasta',
        copay: 3,
        doc_bill: 3,
        insurance_bill: 3,
        upcoming_appt: true
        }
    
    it(`responds w 400 and an error message when the ${field} is missing `, () => {
        delete newAppt[field]
        return supertest(app)
        .post('/api/upcoming_appts')
        .set('Authorization', makeAuthHeader(testUsers[0]))
        .send(newAppt)
        .expect(400, {
            error: { message: `Missing key and value in request body` }
        })
    })
})
    context(`Given an XSS attack entry`, () => {
        const maliciousEntry = {
            id: 911,
            appt_date: '2019-08-11T00:00:00.000Z',
            appt_time: '06:06:00',
            appt_doctor: 'Naughty naughty very naughty <script>alert("xss");</script>',
            appt_location: 'Naughty naughty very naughty <script>alert("xss");</script>',
            appt_purpose: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
            appt_notes: 'Naughty naughty very naughty <script>alert("xss");</script>',
            copay: 3,
            doc_bill: 3,
            insurance_bill: 3,
            upcoming_appt: true,
            user_id: testUser.id
            
        }
    beforeEach('insert malicious entry', () => {
        return db
            .into('upcoming_appts')
            .insert([maliciousEntry])
        })
    it('removes XSS attack content', () => {
        return supertest(app)
            .get(`/api/upcoming_appts/${maliciousEntry.id}`)
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .expect(200)
            .expect(res => {
                expect(res.body.appt_date).to.eql('2019-08-11T00:00:00.000Z')
                expect(res.body.appt_time).to.eql('06:06:00')
                expect(res.body.appt_doctor).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                expect(res.body.appt_location).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                expect(res.body.appt_purpose).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
                expect(res.body.appt_notes).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                expect(res.body.copay).to.eql('3')
                expect(res.body.doc_bill).to.eql('3')
                expect(res.body.insurance_bill).to.eql('3')
                expect(res.body.upcoming_appt).to.eql(true)
                expect(res.body.user_id).to.eql(testUser.id)
            })
        })
    })
})
describe(`DELETE /api/upcoming_appts/:upcoming_appts_id`, () => {
    context(`Given no appts`, () => {
        beforeEach('insert entries', () =>
        helpers.seedUsers(
            db,
            testUsers
        )
    )
    it(`responds with 404`, () => {
        const apptId = 0000
        return supertest(app)
        .delete(`/api/upcoming_appts/${apptId}`)
        .set('Authorization', makeAuthHeader(testUsers[0]))
        .expect(404, { 
            error: { message: `appt does not exist` }
        })
    })
})
    context('Given there are appts in the db', () => {
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
        const expectedAppts = testUpcomingAppts.filter(appt => appt.id !== idToRemove)
        return supertest(app)
        .delete(`/api/upcoming_appts/${idToRemove}`)
        .set('Authorization', makeAuthHeader(testUsers[0]))
        .expect(204)
        .then(res => {
            supertest(app)
                .get('/api/upcoming_appts')
                .expect(expectedAppts)
            })
        })
    })
})

describe(`PATCH /api/upcoming_appts/:upcoming_appts_id`, () => {
    context(`Given no appts`, () => {
        beforeEach('insert entries', () =>
        helpers.seedUsers(
            db,
            testUsers
        )
    )
    it(`responds w 404`, () => {
        const apptId = 0000
        return supertest(app)
        .patch(`/api/upcoming_appts/${apptId}`)
        .set('Authorization', makeAuthHeader(testUsers[0]))
        .expect(404, { 
            error: { message: `appt does not exist` }
        })
    })
})

    context('Given there are appts in the db', () => {
        beforeEach('insert entries', () =>
        helpers.seedTable(
            db,
            testUsers,
            testMedLog,
            testUpcomingAppts
        )
    )
    it('responds w 204 and updated appt', () => {
        const idToUpdate = 2
        const testUser = testUsers[0]
        const updateAppt = {
            appt_date: '2019-09-25T00:00:00.000Z',
            appt_time: '11:35:00',
            appt_doctor: 'Dr.Newman',
            appt_location: 'Arizona XRay',
            appt_purpose: 'x-ray',
            appt_notes: 'none',
            copay: '5',
            doc_bill: '70',
            insurance_bill: '100',
            upcoming_appt: false,
            user_id: testUser.id

        }
        const expectedAppt = {
            ...testUpcomingAppts[idToUpdate - 1],
            ...updateAppt
        }
        return supertest(app)
            .patch(`/api/upcoming_appts/${idToUpdate}`)
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .send(updateAppt)
            .expect(204)
            .then(res => 
                supertest(app)
                .get(`/api/upcoming_appts/${idToUpdate}`)
                .set('Authorization', makeAuthHeader(testUsers[0]))
                .expect(expectedAppt))
    })
    it(`responds w 400 when no required fields are supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
            .patch(`/api/upcoming_appts/${idToUpdate}`)
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .send({ irrelevantField: 'foo'})
            .expect(400, {
                error: {message: `request body must contain appt_date, appt_time, appt_doctor, appt_location, appt_purpose, appt_notes`}
            })
    })
    it(`responds w 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2
        const updateAppt = {
            appt_doctor: 'updated appt appt_doctor',
        }
        const expectedAppt = {
            ...testUpcomingAppts[idToUpdate - 1],
            ...updateAppt
        }
        return supertest(app)
            .patch(`/api/upcoming_appts/${idToUpdate}`)
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .send({
                ...updateAppt,
                fieldToIgnore: 'should not be in GET response'
            })
            .expect(204)
            .then(res => 
                supertest(app)
                .get(`/api/upcoming_appts/${idToUpdate}`)
                .set('Authorization', makeAuthHeader(testUsers[0]))
                .expect(expectedAppt)
                )
                })
            })
        })
    })
})
