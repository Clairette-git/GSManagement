// test-db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  console.log('Testing database connection...');
  console.log('Using the following configuration:');
  console.log(`Host: ${process.env.MYSQL_HOST}`);
  console.log(`User: ${process.env.MYSQL_USER}`);
  console.log(`Database: ${process.env.MYSQL_DATABASE}`);
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE
    });
    
    console.log('✅ Successfully connected to the database!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('Query test result:', rows);
    
    await connection.end();
    console.log('Connection closed.');
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error);
  }
}

testConnection();