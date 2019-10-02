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
      user_id: 1
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
      user_id: 1
    }
  }

  function makeFixtures() {
    const testUsers = MakeUserArray()
    const testMedLog = MakeMedLogArray(testUsers)
    const testUpcomingAppts = MakeUpcomingApptsArray(testUsers)
    return { testUsers, testMedLog, testUpcomingAppts}
  }

  function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('users').insert(preppedUsers)
      .then(() =>
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

  function seedTable(db, users, medlog, upcoming_appts) {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
      }))
    return db.transaction(async trx => {
      await trx.into('users').insert(preppedUsers)
      await trx.raw(
          `SELECT setval('users_id_seq', ?)`,
          [users[users.length - 1].id],
      )
      await trx.into('medlog').insert(medlog)      
      await trx.raw(
                `SELECT setval('medlog_id_seq', ?)`,
                [medlog[medlog.length - 1].id],
              )
      await trx.into('upcoming_appts').insert(upcoming_appts)
      await trx.raw(
               `SELECT setval('upcoming_appts_id_seq', ?)`,
               [upcoming_appts[upcoming_appts.length - 1].id],
       )
    })
  }

  module.exports = {
      seedUsers,
      makeFixtures,
      seedTable,
      MakeUserArray,
      MakeMedLogArray,
      MakeUpcomingApptsArray,
      MakeExpectedEntry,
      cleanTables,
      MakeExpectedAppt    
  }