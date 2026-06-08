require('./src/config/env');
const { app } = require('./src/app');
const { initDatabase } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Estoque Facil rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erro ao inicializar o banco de dados:', error);
    process.exit(1);
  });
