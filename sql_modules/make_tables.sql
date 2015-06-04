-- Creating the user table
CREATE TABLE users
(
  id serial NOT NULL,
  username CHARACTER VARYING(200) CHECK (username <> '') NOT NULL,
  email CHARACTER VARYING(254),
  password_hash CHARACTER VARYING(512),
  password_salt CHARACTER VARYING(512),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Creating the user table
CREATE TABLE user_profiles
(
  id serial NOT NULL,
  users_id INTEGER REFERENCES users,
  first_name CHARACTER VARYING(200),
  last_name CHARACTER VARYING(254),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id)
);

-- Create the main data table
CREATE TABLE posts
(
  id SERIAL NOT NULL,
  user_id INTEGER REFERENCES users NOT NULL,

  -- geolocation data
  latitude NUMERIC CHECK (latitude > -90) CHECK (latitude < 90),
  longitude NUMERIC CHECK (longitude > -180) CHECK (longitude < 180),

  post_timestamp BIGINT, -- in ms since epoch

  -- image upload info
  image_url CHARACTER VARYING(200) CHECK (image_url <> ''),
  image_deletehash  CHARACTER VARYING(200) CHECK (image_deletehash <> ''),

  -- a status entry (like a post)
  status_entry CHARACTER VARYING(5000) CHECK (status_entry <> ''),

  CONSTRAINT posts_pkey PRIMARY KEY (id)
);