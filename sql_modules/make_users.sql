insert into users (username, email, password_hash)
values
  ('jim', 'jim.draycott@gmail.com', '6a40c6fc0e13e2d2539f77927fd01749bd542621590fe9b15b9dd5d1'),
  ('chazrwood', 'charles.ross.wood@gmail.com', '954e8c882b9943dc859cce3306e479e4ef9e3f1a610bd6b3605d70f0');

insert into user_profiles (user_id, first_name, last_name) values (1, 'Jim', 'Draycott'), (2, 'Charlie', 'Wood');