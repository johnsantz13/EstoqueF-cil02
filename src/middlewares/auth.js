const { verifyToken } = require('../utils/token');

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Token invalido ou ausente.' });
  }

  req.user = payload;
  return next();
}

module.exports = {
  authRequired
};
