BEGIN;

TRUNCATE
  upcoming_appts,
  medlog,
  users
  RESTART IDENTITY CASCADE;

INSERT INTO users
(username, email, password)
VALUES
('teep', 'teep@gmail.com', '$2a$12$0a/IDOJ71iGEcefy89On2u65WvxTgouYl3IulMgC0G2jfsz3IcpK2'),
('bigd', 'bigd@yahoo.com', '$2a$12$5WZ606IeYuxzuaGexVJqqezuEiyEpH5.nRByYpVe2ha6jkwdb964q')
;

INSERT INTO medlog 
(date, time, medName, amountTaken, reason, user_id)
VALUES
('2019-08-11', '09:35 AM', 'Promethazine', '1 pill', 'Nausea', 1),
('2019-08-11', '10:00 AM', 'Pantoprazole', '1 pill', 'Acid reflux', 1),
('2019-08-11', '12:00 PM', 'Lorazepam', '1/2 pill', 'Anxiety', 1),
('2019-08-11', '05:00 PM', 'Ondansentron', '1 pill', 'Nausea', 1),
('2019-08-11', '09:25 PM', 'Ambien', '1/2 pill', 'Sleep', 1)
;

INSERT INTO upcoming_appts
(appt_date, appt_time, appt_doctor, appt_location, appt_purpose, appt_notes, copay, doc_bill, insurance_bill, upcoming_appt, user_id)
VALUES
('2019-09-20', '10:30 am', 'Dr.Nagaiah', 'Arizona Oncology', 'chemo treatment #4', 'Dont forget to ask why copay was more during last visit', 45, 0, 20, true, 1),
('2019-09-21', '11:00 am', 'Dr.Nagaiah', 'Arizona Oncology', 'neulasta shot','none', 0, 23, 0, true, 1)
;

-- INSERT INTO past_appts
-- copay, doc_bill, insurance_bill, other_notes, upcoming_appts_id, user_id)
-- VALUES(
-- (45, 0, 20, 'waiting on doc bill', 1, 1),
-- (0, 23, 0, 'messed up copay', 2, 1)
-- ;

COMMIT;