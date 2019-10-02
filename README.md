# **MediGenda-Server**

MediGenda is a medical organization tool, built to keep track of upcoming and past medical appointments, billing, and medicinal intake. 

# Server Hosted here:

(https://floating-citadel-93144.herokuapp.com/)

# API Documentation

Users

* GET '/api/users to view all users

* GET '/api/users/:user_id retrieves user by id

* POST '/api/users creates a new user account

Medlog

* GET '/api/medlog view all medication log entries for specified user

* GET '/api/medlog/:medlog_id gets a single medication log entry by id

* POST '/api/medlog to post a new medication log entry

* PATCH '/api/medlog/:medlog_id to update an exisiting medication log entry

* DELETE '/api/medlog/:medlog_id to delete a medlog entry

Upcoming Appointments

* GET '/api/upcoming_appts view all upcoming appointments for specified user

* GET '/api/upcoming_appts/:upcoming_appt_id gets a single appointment by id

* POST '/api/upcoming_appts to post a new appointment entry

* PATCH '/api/upcoming_appts/:upcoming_appt_id updates an exisiting appointment

* DELETE '/api/upcoming_appts/:upcoming_appt_id to delete an appointment

Authentication

* POST '/api/auth/login matches given credentials and provides a JWT token

# Technology Used 

* Node.js
* Express
* Mocha
* Chai
* Postgres
* Knex.js
* Supertest

# Security 

Application uses JWT authentication





