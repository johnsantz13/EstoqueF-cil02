const { AbacatePayClient } = require('../services/abacatePayClient');

const abacatePay = new AbacatePayClient();

function toPositiveInteger(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return null;
  return Math.round(number);
}

function requireId(req) {
  const id = req.params.id || req.query.id || req.body.id;
  if (!id) {
    const error = new Error('Informe o id da cobranca.');
    error.status = 400;
    throw error;
  }
  return id;
}

function buildPixPayload(body) {
  const amount = toPositiveInteger(body.amount);
  if (!amount) {
    const error = new Error('Informe amount em centavos, maior que zero.');
    error.status = 400;
    throw error;
  }

  return {
    amount,
    description: body.description,
    expiresIn: body.expiresIn ? toPositiveInteger(body.expiresIn) : undefined,
    customer: body.customer,
    metadata: body.metadata
  };
}

async function createPix(req, res, next) {
  try {
    const result = await abacatePay.createTransparentPix(buildPixPayload(req.body));
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function listPix(req, res, next) {
  try {
    const result = await abacatePay.listTransparentPix(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function checkPix(req, res, next) {
  try {
    const result = await abacatePay.checkTransparentPix(requireId(req));
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function simulatePix(req, res, next) {
  try {
    const result = await abacatePay.simulateTransparentPix(requireId(req), req.body.metadata);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function createCheckout(req, res, next) {
  try {
    const result = await abacatePay.createCheckout(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function listCheckouts(req, res, next) {
  try {
    const result = await abacatePay.listCheckouts(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getCheckout(req, res, next) {
  try {
    const result = await abacatePay.getCheckout(requireId(req));
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function createCustomer(req, res, next) {
  try {
    const result = await abacatePay.createCustomer(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function listCustomers(req, res, next) {
  try {
    const result = await abacatePay.listCustomers(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getCustomer(req, res, next) {
  try {
    const result = await abacatePay.getCustomer(requireId(req));
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function deleteCustomer(req, res, next) {
  try {
    const result = await abacatePay.deleteCustomer(requireId(req));
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const result = await abacatePay.createProduct(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function listProducts(req, res, next) {
  try {
    const result = await abacatePay.listProducts(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getProduct(req, res, next) {
  try {
    const result = await abacatePay.getProduct(requireId(req));
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const result = await abacatePay.deleteProduct(requireId(req));
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getStore(req, res, next) {
  try {
    const result = await abacatePay.getStore();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPix,
  listPix,
  checkPix,
  simulatePix,
  createCheckout,
  listCheckouts,
  getCheckout,
  createCustomer,
  listCustomers,
  getCustomer,
  deleteCustomer,
  createProduct,
  listProducts,
  getProduct,
  deleteProduct,
  getStore
};
