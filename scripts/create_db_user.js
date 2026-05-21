const mysql = require('mysql2/promise');

async function createDatabaseAndUser() {
  const rootPasswordsToTry = ['', 'root', 'password', '123456', '12345678', '123456789@abc'];
  let connection;
  let connected = false;

  for (const pwd of rootPasswordsToTry) {
    try {
      console.log(`Trying to connect as root with password: '${pwd}'...`);
      connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: pwd,
      });
      console.log(`✅ Connected successfully as root with password '${pwd}'.`);
      connected = true;
      break;
    } catch (err) {
      if (err.code === 'ER_ACCESS_DENIED_ERROR' || err.code === 'ER_ACCESS_DENIED_NO_PASSWORD_ERROR') {
        continue;
      } else {
        console.error('Connection error:', err);
        return;
      }
    }
  }

  if (!connected) {
    console.error('❌ Failed to connect as root. Please provide the correct root password.');
    return;
  }

  try {
    console.log('Creating database diredaod_office_management...');
    await connection.query("CREATE DATABASE IF NOT EXISTS \`diredaod_office_management\`;");

    console.log('Creating user diredaod_office_management...');
    await connection.query("CREATE USER IF NOT EXISTS 'diredaod_office_management'@'localhost' IDENTIFIED BY '123456789@abc';");
    
    // In some older mysql versions, IF NOT EXISTS might not work for CREATE USER or we might need ALTER USER
    // Let's force the password update just in case it exists:
    try {
      await connection.query("ALTER USER 'diredaod_office_management'@'localhost' IDENTIFIED BY '123456789@abc';");
    } catch (e) {
      // ignore
    }

    console.log('Granting privileges...');
    await connection.query("GRANT ALL PRIVILEGES ON \`diredaod_office_management\`.* TO 'diredaod_office_management'@'localhost';");

    console.log('Flushing privileges...');
    await connection.query("FLUSH PRIVILEGES;");

    console.log('✅ Database and user created successfully!');
  } catch (err) {
    console.error('Error executing queries:', err);
  } finally {
    await connection.end();
  }
}

createDatabaseAndUser();
