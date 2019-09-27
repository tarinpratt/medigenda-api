ALTER TABLE medlog 
    DROP COLUMN user_id;

ALTER TABLE upcoming_appts 
    DROP COLUMN user_id;

DROP TABLE IF EXISTS users;