CREATE TYPE finished_type AS ENUM (
    'fullTime',
    'overTime',
    'penalties'
);

CREATE TABLE "user" (
    id serial NOT NULL PRIMARY KEY,
    name varchar(255) UNIQUE NOT NULL
);

CREATE TABLE league (
    id serial NOT NULL PRIMARY KEY,
    name varchar(255) UNIQUE NOT NULL
);

CREATE TABLE team (
    id serial NOT NULL PRIMARY KEY,
    name varchar(255) UNIQUE NOT NULL,
    league_id integer NOT NULL REFERENCES league (id)
);


CREATE TABLE match (
    id serial NOT NULL PRIMARY KEY,
    league_id integer NOT NULL REFERENCES league (id),
    home_id integer NOT NULL REFERENCES team (id),
    away_id integer NOT NULL REFERENCES team (id),
    finished_time timestamp with time zone,
    home_score integer,
    away_score integer,
    home_user_id integer NOT NULL REFERENCES "user" (id),
    away_user_id integer NOT NULL REFERENCES "user" (id),
    finished_type finished_type,
    home_penalty_goals integer,
    away_penalty_goals integer
);
