const express = require('express');
const path = require('path');
const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();
const rootDir = path.resolve(__dirname, '..');
const viewsDir = path.join(rootDir, 'views');

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

app.use('/api', apiRoutes);
app.use(express.static(viewsDir));
app.use(express.static(rootDir, { index: false }));

app.get('/', (req, res) => {
  res.sendFile(path.join(viewsDir, 'index.html'));
});

app.use(notFound);
app.use(errorHandler);

module.exports = { app };
