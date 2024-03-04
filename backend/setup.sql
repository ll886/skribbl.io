CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    password TEXT
);
