CREATE TABLE users (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    password TEXT
);

ALTER TABLE medlog
    ADD COLUMN
        user_id INTEGER REFERENCES users(id)
        ON DELETE SET NULL;

ALTER TABLE upcoming_appts
    ADD COLUMN
        user_id INTEGER REFERENCES users(id)
        ON DELETE SET NULL;


        
