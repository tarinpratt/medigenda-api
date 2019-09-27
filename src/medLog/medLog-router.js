const path = require('path')
const express = require('express')
const MedLogService  = require('./medLog-service')
const { requireAuth } = require('../middleware/jwt-auth')
const medLogRouter = express.Router()
const jsonParser = express.json()
const xss = require('xss')

const serializeEntry = entry => ({
    id: entry.id,
    date: entry.date,
    time: entry.time,
    medname: xss(entry.medname),
    amounttaken: entry.amounttaken,
    reason: xss(entry.reason),
    user_id: entry.user_id
})

medLogRouter   
    .route('/')
    .get(requireAuth, (req, res, next) => {
        const knexInstance = req.app.get('db')
            MedLogService.getAllEntriesByUser(knexInstance, req.user.id)
            .then(entries => {
                res.json(entries)
            })
            .catch(next)
    })

     .post(requireAuth, jsonParser, (req, res, next) => {
        const { date, time, medname, amounttaken, reason} = req.body
        const newEntry = { date, time, medname, amounttaken, reason}
        if(!date || !time || !medname || !amounttaken || !reason ) {
            return res.status(400).json({
                error: { message: `Missing key and value in request body` }
            })
        }
        newEntry.user_id = req.user.id

        MedLogService.insertEntry(
            req.app.get('db'),
            newEntry
        )
        .then(entry => {
            res.status(201)
                .location(path.posix.join(req.originalUrl + `/${entry.id}`))
                .json(serializeEntry(entry))
        })
        .catch(next)


     })



medLogRouter
  .route('/:medlog_id')
  .all(requireAuth,(req, res, next) => {
    MedLogService.getById(
      req.app.get('db'),
      req.params.medlog_id
    )
      .then(entry => {
        if (!entry) {
          return res.status(404).json({
            error: { message: `entry does not exist` }
          })
        }
        res.entry = entry
        next()
    })
    .catch(next)
})
       .get((req, res) => { 
           res.json(serializeEntry(res.entry))
 
       })
       
  .delete( (req, res, next) => {
      MedLogService.deleteEntry(
          req.app.get('db'),
          req.params.medlog_id
      )
        .then(numRowsAffected => {
            if(numRowsAffected > 0 ) {
                res.status(204).end()
            } else {
                res.status(404).json({
                    error: { message: `entry does not exist` }
                })
            }
        })
        .catch(next)
  })

  .patch( jsonParser, (req, res, next) => {
      const { date, time, medname, amounttaken, reason } = req.body
      const entryToUpdate = { date, time, medname, amounttaken, reason }

      const numberOfValues = Object.values(entryToUpdate).filter(Boolean).length
      if(numberOfValues === 0) {
          return res.status(400).json({
              error: {message : `request body must contain date, time, medname, amounttaken, reason`}
          })
      }
      entryToUpdate.user_id = req.user.id
      MedLogService.updateEntry(
          req.app.get('db'),
          req.params.medlog_id,
          entryToUpdate
      )
      .then(numRowsAffected => {
        if(numRowsAffected > 0 ) {
            res.status(204).end()
        } else {
            res.status(404).json({
                error: { message: `entry does not exist` }
            })
        }
        
      })
      .catch(next)
  } )


module.exports = medLogRouter