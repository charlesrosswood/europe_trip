#!/usr/bin/env bash

echo "Dropping previous tables..."
psql -h localhost -p 5432 -U postgres -d europe_trip -f ../sql_modules/drop_tables.sql
echo "Dropping previous database..."
psql -h localhost -p 5432 -U postgres -f ../sql_modules/drop_db.sql
echo "Creating new DB and tables..."
psql -h localhost -p 5432 -U postgres -f ../sql_modules/make_tables.sql
echo "Creating users..."
psql -h localhost -p 5432 -U postgres -d europe_trip -f ../sql_modules/make_users.sql
echo "Creating posts..."
#psql -h localhost -p 5432 -U postgres -d europe_trip -f ../sql_modules/make_posts.sql
echo "Done"
