const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { loadEnvFile } = require('../src/config/env');

test('loadEnvFile should let project .env values override existing process env values', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'env-loader-'));
  const envPath = path.join(tempDir, '.env');
  fs.writeFileSync(envPath, 'MYSQL_PASSWORD=\nMYSQL_HOST=localhost\n', 'utf8');

  const originalPassword = process.env.MYSQL_PASSWORD;
  const originalHost = process.env.MYSQL_HOST;

  process.env.MYSQL_PASSWORD = 'root';
  process.env.MYSQL_HOST = '127.0.0.1';

  try {
    loadEnvFile(envPath);
    assert.equal(process.env.MYSQL_PASSWORD, '');
    assert.equal(process.env.MYSQL_HOST, 'localhost');
  } finally {
    if (originalPassword === undefined) {
      delete process.env.MYSQL_PASSWORD;
    } else {
      process.env.MYSQL_PASSWORD = originalPassword;
    }

    if (originalHost === undefined) {
      delete process.env.MYSQL_HOST;
    } else {
      process.env.MYSQL_HOST = originalHost;
    }
  }
});
