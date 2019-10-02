const MedLogService = {

    getAllEntries(db) {
        return db
        .from('medlog AS md')
        .select(
            'md.id',
            'md.date',
            'md.time',
            'md.medname',
            'md.amounttaken',
            'md.reason',
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
        'md.user_id',
        'usr.id',
        )
        .groupBy('md.id', 'md.user_id', 'usr.id')
        .orderBy('md.id', 'asc')
    },

    insertEntry(db, newEntry) {
        return db
            .insert(newEntry)
            .into('medlog')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    getById(db, id) {
        return db
            .from('medlog as md')
            .select(
                'md.id',
                'md.date',
                'md.time',
                'md.medname',
                'md.amounttaken',
                'md.reason',
                'md.user_id',
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
                'md.user_id',
                'usr.id',
            )
            .where('md.id', id)
            .first()
    },

    getAllEntriesByUser(knex, user_id){
        return knex('medlog')
            .where({ user_id })
    },

    deleteEntry(knex, id) {
        return knex('medlog')
          .where({ id })
          .delete()
      },

    updateEntry(knex, id, newMedLogFields) {
        return knex('medlog')
            .where({ id })
            .update(newMedLogFields)
    },  
}


module.exports = MedLogService