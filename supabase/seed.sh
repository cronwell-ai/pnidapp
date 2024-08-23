#!/bin/bash

# Apply the main schema dump
PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres -f supabase/schema.sql

# Apply the additional changes
PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres -f supabase/storage.sql