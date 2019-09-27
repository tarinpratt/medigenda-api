const bcrypt = require('bcryptjs')

  function MakeUserArray() {
    return [
            {
                id: 1,
                username: 'teep',
                email: 'teep@gmail.com',
                password: '12345'
            },
            {
                id: 2,
                username: 'bigd',
                email: 'bigd@yahoo.com',
                password: 'password'
            }
           
        
    ]

}

function MakeMedLogArray(users) {
    return [
            {
                id: 1,
                date: '2019-08-11T00:00:00.000Z',
                time: '09:35:00',
                medname: 'Promethazine',
                amounttaken: '1 pill',
                reason: 'Nausea',
                user_id: users[0].id
            },
            {
                id: 2,
                date: '2019-08-11T00:00:00.000Z',
                time: '10:00:00',
                medname: 'Pantoprazole',
                amounttaken: '1 pill',
                reason: 'Acid Reflux',
                user_id: users[0].id
            },
            {
                id: 3,
                date: '2019-08-11T00:00:00.000Z',
                time: '12:00:00',
                medname: 'Lorazepam',
                amounttaken: '1/2 pill',
                reason: 'Anxiety',
                user_id: users[0].id
            },
            {
                id: 4,
                date: '2019-08-11T00:00:00.000Z',
                time: '17:00:00',
                medname: 'Ondansentron',
                amounttaken: '1 pill',
                reason: 'Nausea',
                user_id: users[0].id
            },
            {
                id: 5,
                date: '2019-08-11T00:00:00.000Z',
                time: '21:25:00',
                medname: 'Ambien',
                amounttaken: '1/2 pill',
                reason: 'Sleep',
                user_id: users[0].id
            }
        
    ]

}

// function MakePastApptsArray(users, upcoming_appts) {
//     return [
//             {
//                 id: 1,
//                 copay: '45',
//                 doc_bill: '0',
//                 insurance_bill: '53.75',
//                 other_notes: 'Waiting on doctor bill',
//                 upcoming_appts_id: upcoming_appts[0].id,
//                 user_id: users[0].id
                
//             },
//             {
//                 id: 2,
//                 copay: '0',
//                 doc_bill: '0',
//                 insurance_bill: '0',
//                 other_notes: `Haven't received billing info yet`,
//                 upcoming_appts_id: upcoming_appts[1].id,
//                 user_id: users[0].id
//             }
//     ]
 
// }
function MakeUpcomingApptsArray(users) {
    return [
            {
                id: 1,
                appt_date: '2019-09-20T00:00:00.000Z',
                appt_time: '10:30:00',
                appt_doctor: 'Dr.Nagaiah',
                appt_location: 'Arizona Oncology',
                appt_purpose: 'chemo treatment #4',
                appt_notes: 'Dont forget to ask why copay was more during last visit',
                copay: '45',
                doc_bill: '0',
                insurance_bill: '53.75',
                upcoming_appt: true,
                user_id: users[0].id
            },
            {
                id: 2,
                appt_date: '2019-09-21T00:00:00.000Z',
                appt_time: '11:30:00',
                appt_doctor: 'Dr.Nagaiah',
                appt_location: 'Arizona Oncology',
                appt_purpose: 'neulasta shot',
                appt_notes: '',
                copay: '45',
                doc_bill: '0',
                insurance_bill: '53.75',
                upcoming_appt: true,
                user_id: users[0].id
            }
    ]
 
}

function MakeExpectedEntry(users, entry) {
    const user = users
      .find(user => user.id === entry.user_id)
    return {
      id: entry.id,
      date: entry.date,
      time: entry.time,
      medname: entry.medname,
      amounttaken: entry.amounttaken,
      reason: entry.reason,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    }
  }

  function MakeExpectedAppt(users, appt) {
    const user = users
      .find(user => user.id === appt.user_id)
    return {
      id: appt.id,
      appt_date: appt.appt_date,
      appt_time: appt.appt_time,
      appt_doctor: appt.appt_doctor,
      appt_location: appt.appt_location,
      appt_purpose: appt.appt_purpose,
      appt_notes: appt.appt_notes,
      copay: appt.copay,
      doc_bill: appt.doc_bill,
      insurance_bill: appt.insurance_bill,
      upcoming_appt: appt.upcoming_appt,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    }
  }

  function MakeExpectedPastAppt(users, upcoming_appts, appt) {
    const user = users.find(user => user.id === appt.user_id)
    const upcoming_appt = upcoming_appts.find(upcoming_appt => upcoming_appt.id === appt.upcoming_appts_id)
    return {
      id: appt.id,
      copay: appt.copay,
      doc_bill: appt.doc_bill,
      insurance_bill: appt.insurance_bill,
      other_notes: appt.other_notes,
      upcoming_appts: {
        id: upcoming_appt.id,
        appt_date: upcoming_appt.appt_date,
        appt_time: upcoming_appt.appt_time,
        appt_doctor: upcoming_appt.appt_doctor,
        appt_location: upcoming_appt.appt_location,
        appt_purpose: upcoming_appt.appt_purpose,
        appt_notes: upcoming_appt.appt_notes,
        user: upcoming_appt.user_id
      },
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
          } 
      }
    }
  

  function makeFixtures() {
    const testUsers = MakeUserArray()
    const testMedLog = MakeMedLogArray(testUsers)
    const testUpcomingAppts = MakeUpcomingApptsArray(testUsers)
    // const testPastAppts = MakePastApptsArray(testUsers, testUpcomingAppts)
    return { testUsers, testMedLog, testUpcomingAppts}
  }

  function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('users').insert(preppedUsers)
      .then(() =>
        // update the auto sequence to stay in sync
        db.raw(
          `SELECT setval('users_id_seq', ?)`,
          [users[users.length - 1].id],
      )
      )
  }

  function cleanTables(db) {
    return db.raw(
      `TRUNCATE
      upcoming_appts,
      medlog,
      users
        RESTART IDENTITY CASCADE`
    )
  }

  

  function makeMaliciousMedLog(user) {
    const maliciousMedLog = {
        id: 911,
        date: '2019-08-11T00:00:00.000Z',
        time: '06:06:00',
        medname: 'Naughty naughty very naughty <script>alert("xss");</script>',
        amounttaken: '66',
        reason: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        user_id: user.id,
    }
    const expectedMedLog = {
      ...MakeExpectedEntry([user], maliciousMedLog),
      medname: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      reason: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    }
    return {
      maliciousMedLog,
      expectedMedLog,
    }
  }

  function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('users').insert(preppedUsers)
      .then(() =>
        // update the auto sequence to stay in sync
        db.raw(
          `SELECT setval('users_id_seq', ?)`,
          [users[users.length - 1].id],
      )
      )
  }

  function seedMaliciousMedLog(db, user, medlog) {
    return seedUsers(db, [user])
    .then(() =>
      db
        .into('medlog')
        .insert([medlog])
    )
}

  
  function seedTable(db, users, medlog, upcoming_appts) {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
      }))
    // use a transaction to group the queries and auto rollback on any failure
    return db.transaction(async trx => {
      await trx.into('users').insert(preppedUsers)
      await trx.raw(
          `SELECT setval('users_id_seq', ?)`,
          [users[users.length - 1].id],
      )

      await trx.into('medlog').insert(medlog)      
      // update the auto sequence to match the forced id values
       await trx.raw(
                `SELECT setval('medlog_id_seq', ?)`,
                [medlog[medlog.length - 1].id],
              )
       await trx.into('upcoming_appts').insert(upcoming_appts)
       await trx.raw(
               `SELECT setval('upcoming_appts_id_seq', ?)`,
               [upcoming_appts[upcoming_appts.length - 1].id],
       )
      //  await trx.into('past_appts').insert(past_appts)
      //  await trx.raw(
      //          `SELECT setval('past_appts_id_seq', ?)`,
      //          [past_appts[past_appts.length - 1].id]
       //)
 
    })
  }

  module.exports = {
      seedUsers,
      makeFixtures,
      seedTable,
      MakeUserArray,
      MakeMedLogArray,
      //MakePastApptsArray,
      MakeUpcomingApptsArray,
      MakeExpectedEntry,
      cleanTables,
      makeMaliciousMedLog,
      seedMaliciousMedLog,
      MakeExpectedAppt
      //MakeExpectedPastAppt
      
  }