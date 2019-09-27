const UpcomingApptsService = {
    getAllAppts(knex) {
        return knex.select('*').from('upcoming_appts')
    }, 

    getAllEntries(db) {
        return db
        .from('upcoming_appts AS upa')
        .select(
            'upa.id',
            'upa.appt_date',
            'upa.appt_time',
            'upa.appt_doctor',
            'upa.appt_location',
            'upa.appt_purpose',
            'upa.appt_notes',
            'upa.copay',
            'upa.doc_bill',
            'upa.insurance_bill',
            'upa.upcoming_appt',
            db.raw(
                `json_strip_nulls(
                    json_build_object(
                        'id', usr.id,
                        'username', usr.username,
                        'email', usr.email
                    )
                ) AS "user"`
            ),
        )
        .join('users as usr',
        'upa.user_id',
        'usr.id',
        )
        .groupBy('upa.id', 'upa.user_id', 'usr.id')
        .orderBy('upa.id', 'asc')
    },

    insertAppt(db, newAppt) {
        return db
            .insert(newAppt)
            .into('upcoming_appts')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
   
    getById(db, id) {
        return db
            .from('upcoming_appts as upa')
            .select(
                'upa.id',
                'upa.appt_date',
                'upa.appt_time',
                'upa.appt_doctor',
                'upa.appt_location',
                'upa.appt_purpose',
                'upa.appt_notes',
                'upa.copay',
                'upa.doc_bill',
                'upa.insurance_bill',
                'upa.upcoming_appt',
                'upa.user_id',
                db.raw(
                    `row_to_json(
                        (SELECT tmp FROM(
                            SELECT
                            usr.id,
                            usr.username,
                            usr.email
                        ) tmp)
                    ) AS "user"`
                )
            )
            .join(
                'users AS usr',
                'upa.user_id',
                'usr.id',
            )
            .where('upa.id', id)
            .first()
    },

    getAllEntriesByUser(knex, user_id){
        return knex('upcoming_appts')
            .where({ user_id })
    },

    deleteAppt(knex, id) {
        return knex('upcoming_appts')
          .where({ id })
          .delete()
      },
    updateAppt(knex, id, newUpcomingApptsFields) {
        return knex('upcoming_appts')
            .where({ id })
            .update(newUpcomingApptsFields)
    },
    
}

module.exports = UpcomingApptsService