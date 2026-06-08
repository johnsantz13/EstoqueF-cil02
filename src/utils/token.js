const crypto = require('crypto');

const secret = process.env.APP_SECRET || 'estoque-facil-dev-secret';

function signToken(payload, expiresInSeconds = 86400) {
  const header = encodeBase64Url({ alg: 'HS256', typ: 'JWT' });
  const body = encodeBase64Url({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds
  });
  const signature = sign(`${header}.${body}`);
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  const [header, body, signature] = String(token || '').split('.');
  if (!header || !body || !signature) return null;
  const expected = sign(`${header}.${body}`);
  if (!safeEqual(signature, expected)) return null;

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

function encodeBase64Url(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function sign(value) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

module.exports = {
  signToken,
  verifyToken
};
