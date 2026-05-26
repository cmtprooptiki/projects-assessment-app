#!/bin/sh

echo "Running database migrations..."
RESULT=$(npx sequelize-cli db:migrate 2>&1)
EXIT_CODE=$?
echo "$RESULT"

if [ $EXIT_CODE -ne 0 ]; then
  if echo "$RESULT" | grep -q "Duplicate"; then
    echo "Tables already exist (imported DB) - marking all migrations as complete..."
    node -e "
const mysql = require('mysql2/promise');
async function fix() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  await conn.execute(\`
    INSERT IGNORE INTO sequelizemeta (name) VALUES
    ('20240101000001-create-employees.js'),
    ('20240101000002-create-projects.js'),
    ('20240101000003-create-roles.js'),
    ('20240101000004-create-project-participations.js'),
    ('20240101000005-create-users.js'),
    ('20240101000006-remove-allocation-percentage.js'),
    ('20240101000007-create-clients.js'),
    ('20240101000008-update-projects-add-clientid.js'),
    ('20240101000009-add-photo-to-employees.js'),
    ('20240101000010-create-departments.js'),
    ('20240101000011-update-employees-position-to-roleid.js'),
    ('20240101000012-drop-employees-roleid.js')
  \`);
  await conn.end();
  console.log('All migrations marked as complete.');
}
fix().catch(e => { console.error(e); process.exit(1); });
"
    if [ $? -ne 0 ]; then
      echo "Failed to mark migrations as complete."
      exit 1
    fi
  else
    echo "Migration failed with unexpected error. Aborting."
    exit 1
  fi
fi

echo "Starting server..."
exec node dist/app.js
