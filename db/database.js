require('dotenv').config();
const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || '72.60.41.168',
  user: process.env.DB_USER || 'english_app',
  password: 'DB_PASSWORD' in process.env ? process.env.DB_PASSWORD : 'EnglishApp@2026!',
  database: process.env.DB_NAME || 'it_english_learning',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool(DB_CONFIG);
  }
  return pool;
}

async function query(sql, params = []) {
  const p = getPool();
  const [rows] = await p.execute(sql, params);
  return rows;
}

async function getDb() {
  return { query, execute: query };
}

module.exports = { getDb, query, getPool };
