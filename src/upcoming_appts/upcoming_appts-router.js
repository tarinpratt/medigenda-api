const path = require('path')
const express = require('express')
const UpcomingApptsService  = require('./upcoming_appts-service')
const { requireAuth } = require('../middleware/jwt-auth')
const upcomingApptsRouter = express.Router()
const jsonParser = express.json()
const xss = require('xss')

const serializeAppt = appt => ({
    id: appt.id,
    appt_date: appt.appt_date,
    appt_time: appt.appt_time,
    appt_doctor: xss(appt.appt_doctor),
    appt_location: xss(appt.appt_location),
    appt_purpose: xss(appt.appt_purpose),
    appt_notes: xss(appt.appt_notes),
    copay: appt.copay,
    doc_bill: appt.doc_bill,
    insurance_bill: appt.insurance_bill,
    upcoming_appt: appt.upcoming_appt,
    user_id: appt.user_id
})

upcomingApptsRouter   
    .route('/')
    .get(requireAuth, (req, res, next) => {
        const knexInstance = req.app.get('db')
        UpcomingApptsService.getAllEntriesByUser(knexInstance, req.user.id)
        .then(appts => {
            res.json(appts)
        })
        .catch(next)
    })


     .post(requireAuth, jsonParser, (req, res, next) => {
        const { appt_date, appt_time, appt_doctor, appt_location, appt_purpose, appt_notes, copay, doc_bill, insurance_bill, upcoming_appt} = req.body
        const newAppt = { appt_date, appt_time, appt_doctor, appt_location, appt_purpose, appt_notes, copay, doc_bill, insurance_bill, upcoming_appt}
        
        if(!appt_date || !appt_time || !appt_doctor || !appt_location || !appt_purpose ||!copay || !doc_bill || !insurance_bill || !upcoming_appt ) {
            return res.status(400).json({
                error: { message: `Missing key and value in request body` }
            })
        }

        newAppt.user_id = req.user.id

        UpcomingApptsService.insertAppt(
            
            req.app.get('db'),
            newAppt
        )
        .then(appt => {
            res.status(201)
                .location(path.posix.join(req.originalUrl + `/${appt.id}`))
                .json(serializeAppt(appt))
        })
        .catch(next)


     })



upcomingApptsRouter
  .route('/:upcoming_appt_id')
  .all(requireAuth, (req, res, next) => {
    UpcomingApptsService.getById(
      req.app.get('db'),
      req.params.upcoming_appt_id
    )
      .then(appt => {
        if (!appt) {
          return res.status(404).json({
            error: { message: `appt does not exist` }
          })
        }
        res.appt = appt
        next()
    })
    .catch(next)
})
       .get((req, res) => { 
           res.json(serializeAppt(res.appt))
 
       })
       
  .delete( (req, res, next) => {
    UpcomingApptsService.deleteAppt(
          req.app.get('db'),
          req.params.upcoming_appt_id
      )
        .then(numRowsAffected => {
            if(numRowsAffected > 0 ) {
                res.status(204).end()
            } else {
                res.status(404).json({
                    error: { message: `appt does not exist` }
                })
            }
        })
        .catch(next)
  })

  .patch( jsonParser, (req, res, next) => {
      const { appt_date, appt_time, appt_doctor, appt_location, appt_purpose, appt_notes, copay, doc_bill, insurance_bill, upcoming_appt } = req.body
      const apptToUpdate = { appt_date, appt_time, appt_doctor, appt_location, appt_purpose, appt_notes, copay, doc_bill, insurance_bill, upcoming_appt}

      const numberOfValues = Object.values(apptToUpdate).filter(Boolean).length
      if(numberOfValues === 0) {
          return res.status(400).json({
              error: {message : `request body must contain appt_date, appt_time, appt_doctor, appt_location, appt_purpose, appt_notes`}
          })
      }
      apptToUpdate.user_id = req.user.id
      UpcomingApptsService.updateAppt(
          req.app.get('db'),
          req.params.upcoming_appt_id,
          apptToUpdate
      )
      .then(numRowsAffected => {
        if(numRowsAffected > 0 ) {
            res.status(204).end()
        } else {
            res.status(404).json({
                error: { message: `appt does not exist` }
            })
        }
        
      })
      .catch(next)
  } )


module.exports = upcomingApptsRouter