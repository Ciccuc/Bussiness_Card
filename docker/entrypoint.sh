#!/bin/sh
set -eu

echo 'Applying database migrations...'
./node_modules/.bin/prisma migrate deploy

echo 'Seeding the business card data...'
node dist/database/seed/seed.js

exec node dist/main.js
