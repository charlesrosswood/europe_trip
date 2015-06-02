--Creating the user table
CREATE TABLE users
(
  users_id serial NOT NULL,
  username varchar(200),
  email varchar(254),
  password_hash varchar(512),
  password_salt varchar(512),
  CONSTRAINT users_pkey PRIMARY KEY (users_id)
);

--Creating the user table
CREATE TABLE user_profiles
(
  user_profiles_id serial NOT NULL,
  users_id integer REFERENCES users,
  first_name varchar(200),
  last_name varchar(254),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (user_profiles_id)
);

--Creating the  table
CREATE TABLE status_entries
(
  status_entries_id serial NOT NULL,
  users_id integer REFERENCES users, -- FK to user table
  geolocations_id integer REFERENCES geolocations, -- FK to geolocations table
  status_entry varchar(5000),
  CONSTRAINT status_entries_pkey PRIMARY KEY (status_entries_id)
);

--Creating the photo upload table
CREATE TABLE photo_uploads
(
  photo_uploads_id serial NOT NULL,
  users_id integer REFERENCES users, -- FK to user table
  geolocations_id integer REFERENCES geolocations, -- FK to geolocations table
  image_url character varying(200),
  delete_hash character varying(200),
  status_entries_id integer REFERENCES status_entries, -- FK to status_entries table
  CONSTRAINT photo_uploads_pkey PRIMARY KEY (photo_uploads_id)
);

--Creating the photo upload table
CREATE TABLE geolocations
(
  geolocations_id serial NOT NULL,
  users_id integer REFERENCES users, -- FK to user table
  name varchar(500),
  latitude decimal,
  longitude decimal,
  CONSTRAINT geolocations_pkey PRIMARY KEY (geolocations_id)
);