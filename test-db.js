// test-db.js — run once to prove MySQL works:  npm run test:db
require('dotenv').config();
const pool = require('./src/db');

async function test() {
  try {
    // Try to query the database
    const [rows] = await pool.query(
      'SELECT 1 AS ok, DATABASE() AS db, NOW() AS now'
    );
    
    console.log('✅ Connected to MySQL successfully!');
    console.log('Database Details:', rows[0]);
    process.exit(0);
    
  } catch (err) {
    console.error('❌ Connection failed!');
    console.error(err.code || '', err.message);
    
    // Helpful hints if the user forgot to set up their .env file
    if (!process.env.DB_USER || process.env.DB_USER === 'your_aiven_username') {
      console.error('\n⚠️  Missing .env credentials. Did you copy .env.example to .env and add your username/password?');
    }
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n⚠️  Access denied. Check your DB_USER and DB_PASS in .env');
    }
    if (err.code === 'ENOTFOUND') {
      console.error('\n⚠️  Host not found. Check your DB_HOST in .env');
    }
    
    process.exit(1);
  }
}

test();