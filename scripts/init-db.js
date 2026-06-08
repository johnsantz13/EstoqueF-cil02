require('../src/config/env');
const { initDatabase, databaseName } = require('../src/config/database');

initDatabase()
  .then(() => {
    console.log(`Banco MySQL inicializado: ${databaseName}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro ao inicializar banco:', error);
    process.exit(1);
  });
