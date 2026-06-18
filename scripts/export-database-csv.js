require('../src/config/env');

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function toCell(value) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (Buffer.isBuffer(value)) return value.toString('base64');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function toCsv(rows) {
  return `${rows
    .map((row) => row
      .map((value) => {
        const text = toCell(value);
        return /[",\r\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
      })
      .join(';'))
    .join('\r\n')}\r\n`;
}

async function main() {
  const database = process.env.MYSQL_DATABASE || 'estoque_facil';
  const outputDir = path.resolve(__dirname, '..', 'exports', 'banco_csv');
  fs.mkdirSync(outputDir, { recursive: true });

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database,
    dateStrings: false
  });

  const [tables] = await connection.query(
    'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME',
    [database]
  );

  const summary = [['tabela', 'registros', 'arquivo']];
  const structure = [['tabela', 'coluna', 'tipo', 'permite_nulo', 'chave', 'padrao', 'extra']];

  for (const table of tables) {
    const tableName = table.TABLE_NAME;
    const [columns] = await connection.query(`SHOW COLUMNS FROM ${connection.escapeId(tableName)}`);
    const headers = columns.map((column) => column.Field);

    columns.forEach((column) => {
      structure.push([
        tableName,
        column.Field,
        column.Type,
        column.Null,
        column.Key,
        column.Default,
        column.Extra
      ]);
    });

    const [rows] = await connection.query(`SELECT * FROM ${connection.escapeId(tableName)}`);
    const csvRows = [
      headers,
      ...rows.map((row) => headers.map((header) => row[header]))
    ];

    const fileName = `${tableName}.csv`;
    fs.writeFileSync(path.join(outputDir, fileName), `\ufeff${toCsv(csvRows)}`, 'utf8');
    summary.push([tableName, rows.length, fileName]);
  }

  fs.writeFileSync(path.join(outputDir, '_resumo_tabelas.csv'), `\ufeff${toCsv(summary)}`, 'utf8');
  fs.writeFileSync(path.join(outputDir, '_estrutura_colunas.csv'), `\ufeff${toCsv(structure)}`, 'utf8');

  await connection.end();

  console.log(outputDir);
  console.log(`Arquivos gerados: ${tables.length + 2}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
