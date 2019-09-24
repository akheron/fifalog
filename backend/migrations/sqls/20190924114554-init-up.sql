CREATE TABLE "user" (
    id serial PRIMARY KEY,
    name varchar(255) UNIQUE NOT NULL
);

CREATE TABLE league (
    id serial PRIMARY KEY,
    name varchar(255) UNIQUE NOT NULL
);

CREATE TABLE team (
    id serial PRIMARY KEY,
    name varchar(255) UNIQUE NOT NULL,
    league_id integer NOT NULL REFERENCES league (id)
);

CREATE TYPE finished_type AS ENUM (
    'fullTime',
    'overTime',
    'penalties'
);

CREATE TABLE match (
    id serial PRIMARY KEY,
    league_id integer NOT NULL,
    home_user_id integer NOT NULL REFERENCES "user" (id),
    away_user_id integer NOT NULL REFERENCES "user" (id),
    home_id integer NOT NULL REFERENCES team (id),
    away_id integer NOT NULL REFERENCES team (id),
    finished_time timestamp with time zone,
    home_score integer,
    away_score integer,
    finished_type finished_type,
    home_penalty_goals integer,
    away_penalty_goals integer
);


