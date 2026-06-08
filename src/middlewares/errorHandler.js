function notFound(req, res) {
  res.status(404).json({ error: 'Rota nao encontrada.' });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = error.status || 500;
  return res.status(status).json({
    error: error.message || 'Erro interno do servidor.'
  });
}

module.exports = {
  notFound,
  errorHandler
};
