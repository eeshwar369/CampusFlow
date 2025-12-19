const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'academic_exam_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 60000, // 60 seconds
  acquireTimeout: 60000,
  timeout: 60000
};

// Add SSL for Aiven cloud
if (process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud')) {
  dbConfig.ssl = {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  };
}

const pool = mysql.createPool(dbConfig);

// Test database connection with retry
async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log('✅ Database connected successfully');
      console.log(`   Host: ${process.env.DB_HOST}`);
      console.log(`   Database: ${process.env.DB_NAME}`);
      connection.release();
      return true;
    } catch (err) {
      console.error(`❌ Database connection attempt ${i + 1}/${retries} failed:`, err.message);
      if (i < retries - 1) {
        console.log(`   Retrying in 3 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
  console.error('⚠️  Database connection failed after all retries');
  console.error('   The server will continue running, but database operations will fail');
  console.error('   Please check your database credentials and network connection');
  return false;
}

// Test connection on startup
testConnection();

module.exports = pool;
