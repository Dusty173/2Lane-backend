
CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL,
    hashed_pw TEXT NOT NULL,
    email TEXT NOT NULL CHECK (position('@' IN email) > 1),
    created_at TIMESTAMP,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE cars(
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES users ON DELETE CASCADE,
    make VARCHAR(20) NOT NULL,
    model VARCHAR(50) NOT NULL,
    model_year INTEGER NOT NULL
);

CREATE TABLE posts(
    id SERIAL PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    body TEXT,
    user_id INTEGER REFERENCES users ON DELETE CASCADE,
    created_at TIMESTAMP
);

CREATE TABLE drives (
    id SERIAL PRIMARY KEY,
    title VARCHAR(30),
    description TEXT,
    route_link TEXT,
    created_at TIMESTAMP
);

CREATE TABLE users_drives(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users ON DELETE CASCADE,
    drive_id INTEGER REFERENCES drives ON DELETE CASCADE
);

