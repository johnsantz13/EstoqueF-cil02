const models = require('../models');
const { hashPassword } = require('../utils/password');

function safeUser(user) {
  if (!user) return user;
  const { senha_hash, ...safe } = user;
  return safe;
}

async function index(req, res, next) {
  try {
    const users = await models.usuarios.findAll(req.query);
    res.json(users.map(safeUser));
  } catch (error) {
    next(error);
  }
}

async function show(req, res, next) {
  try {
    const user = await models.usuarios.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario nao encontrado.' });
    return res.json(safeUser(user));
  } catch (error) {
    return next(error);
  }
}

async function store(req, res, next) {
  try {
    const nome = req.body.nome || req.body.name;
    const senha = req.body.senha || req.body.password;
    const perfil = req.body.perfil || req.body.role;
    const ativo = req.body.ativo ?? req.body.active;

    if (!nome || !req.body.email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha sao obrigatorios.' });
    }
    const user = await models.usuarios.create({
      nome,
      email: req.body.email,
      senha_hash: hashPassword(senha),
      perfil,
      ativo
    });
    return res.status(201).json(safeUser(user));
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const payload = { ...req.body };
    if (payload.password || payload.senha) {
      payload.senha_hash = hashPassword(payload.senha || payload.password);
      delete payload.password;
      delete payload.senha;
    }
    if (payload.name) {
      payload.nome = payload.name;
      delete payload.name;
    }
    if (payload.role) {
      payload.perfil = payload.role;
      delete payload.role;
    }
    if (payload.active !== undefined) {
      payload.ativo = payload.active;
      delete payload.active;
    }
    const user = await models.usuarios.update(req.params.id, payload);
    if (!user) return res.status(404).json({ error: 'Usuario nao encontrado.' });
    return res.json(safeUser(user));
  } catch (error) {
    return next(error);
  }
}

async function destroy(req, res, next) {
  try {
    const result = await models.usuarios.remove(req.params.id);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  index,
  show,
  store,
  update,
  destroy
};
