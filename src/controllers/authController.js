const database = require('../config/database');
const models = require('../models');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signToken } = require('../utils/token');

async function register(req, res, next) {
  try {
    const nome = req.body.nome || req.body.name;
    const senha = req.body.senha || req.body.password;
    const perfil = req.body.perfil || req.body.role || 'operador';

    if (!nome || !req.body.email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha sao obrigatorios.' });
    }

    const user = await models.usuarios.create({
      nome,
      email: req.body.email,
      senha_hash: hashPassword(senha),
      perfil
    });

    const { senha_hash, ...safeUser } = user;
    return res.status(201).json(safeUser);
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const email = req.body.email;
    const senha = req.body.senha || req.body.password;
    const user = await database.get('SELECT * FROM usuarios WHERE email = ? AND ativo = 1', [email]);

    if (!user || !verifyPassword(senha, user.senha_hash)) {
      return res.status(401).json({ error: 'Email ou senha invalidos.' });
    }

    const token = signToken({ id: user.id, email: user.email, perfil: user.perfil, nome: user.nome });
    return res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        name: user.nome,
        email: user.email,
        perfil: user.perfil,
        role: user.perfil
      }
    });
  } catch (error) {
    return next(error);
  }
}

function me(req, res) {
  return res.json(req.user);
}

module.exports = {
  register,
  login,
  me
};
