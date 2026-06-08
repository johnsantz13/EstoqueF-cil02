require('./env');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { hashPassword } = require('../utils/password');

const databaseName = process.env.MYSQL_DATABASE || 'estoque_facil';
const schemaPath = path.resolve(__dirname, '..', 'database', 'mysql_schema.sql');

const connectionConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  multipleStatements: true,
  charset: 'utf8mb4'
};

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...connectionConfig,
      database: databaseName
    });
  }
  return pool;
}

async function initDatabase() {
  const setupConnection = await mysql.createConnection(connectionConfig);

  try {
    await setupConnection.query(`CREATE DATABASE IF NOT EXISTS ${databaseName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    const [tables] = await setupConnection.query(
      'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? LIMIT 1',
      [databaseName]
    );

    if (tables.length === 0) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await setupConnection.query(schema);
    }
  } finally {
    await setupConnection.end();
  }

  await seedAdminUser();
}

async function exec(sql, params = []) {
  const [result] = await getPool().query(sql, params);
  return result;
}

async function run(sql, params = []) {
  const [result] = await getPool().execute(sql, params);
  return {
    id: result.insertId,
    changes: result.affectedRows
  };
}

async function get(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows[0];
}

async function all(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

async function seedAdminUser() {
  const admin = await get('SELECT id FROM usuarios WHERE email = ?', ['admin@estoquefacil.com']);
  const passwordHash = hashPassword('1234');

  if (!admin) {
    await run(
      'INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)',
      ['Administrador', 'admin@estoquefacil.com', passwordHash, 'admin']
    );
    return;
  }

  await run(
    'UPDATE usuarios SET senha_hash = ?, perfil = ? WHERE email = ? AND senha_hash = ?',
    [passwordHash, 'admin', 'admin@estoquefacil.com', 'trocar-por-hash-gerado-no-backend']
  );
}

module.exports = {
  databaseName,
  initDatabase,
  exec,
  run,
  get,
  all,
  getPool
};

