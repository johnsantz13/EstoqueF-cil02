const crypto = require('crypto');

const DEFAULT_BASE_URL = 'https://api.abacatepay.com/v2';

class AbacatePayError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'AbacatePayError';
    this.status = status;
    this.details = details;
  }
}

function cleanBaseUrl(baseUrl) {
  return String(baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
}

class AbacatePayClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.ABACATEPAY_API_KEY;
    this.baseUrl = cleanBaseUrl(options.baseUrl || process.env.ABACATEPAY_BASE_URL);
  }

  ensureApiKey() {
    if (!this.apiKey) {
      throw new AbacatePayError('Configure ABACATEPAY_API_KEY no arquivo .env.', 500);
    }
  }

  async request(method, path, options = {}) {
    this.ensureApiKey();

    const url = new URL(`${this.baseUrl}${path}`);
    Object.entries(options.query || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const text = await response.text();
    let payload = null;

    try {
      payload = text ? JSON.parse(text) : null;
    } catch (error) {
      throw new AbacatePayError('A AbacatePay retornou uma resposta invalida.', response.status, text);
    }

    if (!response.ok || payload?.success === false) {
      let message = payload?.error || `Erro na AbacatePay (${response.status}).`;

      if (/insufficient permissions/i.test(message)) {
        message = 'A chave da AbacatePay nao tem permissao para criar PIX. Gere uma API key com permissao de Checkout/Checkout Transparente no painel da AbacatePay.';
      }

      throw new AbacatePayError(message, response.status, payload);
    }

    return payload;
  }

  createTransparentPix(data) {
    return this.request('POST', '/transparents/create', {
      body: {
        method: 'PIX',
        data
      }
    });
  }

  listTransparentPix(query) {
    return this.request('GET', '/transparents/list', { query });
  }

  checkTransparentPix(id) {
    return this.request('GET', '/transparents/check', { query: { id } });
  }

  simulateTransparentPix(id, metadata = {}) {
    return this.request('POST', '/transparents/simulate-payment', {
      query: { id },
      body: { metadata }
    });
  }

  createCheckout(data) {
    return this.request('POST', '/checkouts/create', { body: data });
  }

  listCheckouts(query) {
    return this.request('GET', '/checkouts/list', { query });
  }

  getCheckout(id) {
    return this.request('GET', '/checkouts/one', { query: { id } });
  }

  createCustomer(data) {
    return this.request('POST', '/customers/create', { body: data });
  }

  listCustomers(query) {
    return this.request('GET', '/customers/list', { query });
  }

  getCustomer(id) {
    return this.request('GET', '/customers/get', { query: { id } });
  }

  deleteCustomer(id) {
    return this.request('POST', '/customers/delete', { body: { id } });
  }

  createProduct(data) {
    return this.request('POST', '/products/create', { body: data });
  }

  listProducts(query) {
    return this.request('GET', '/products/list', { query });
  }

  getProduct(id) {
    return this.request('GET', '/products/get', { query: { id } });
  }

  deleteProduct(id) {
    return this.request('POST', '/products/delete', { body: { id } });
  }

  createWebhook(data) {
    return this.request('POST', '/webhooks/create', { body: data });
  }

  listWebhooks(query) {
    return this.request('GET', '/webhooks/list', { query });
  }

  getWebhook(id) {
    return this.request('GET', '/webhooks/get', { query: { id } });
  }

  deleteWebhook(id) {
    return this.request('POST', '/webhooks/delete', { body: { id } });
  }

  getStore() {
    return this.request('GET', '/store/get');
  }

  static verifyWebhookSignature(rawBody, signature, secret) {
    if (!rawBody || !signature || !secret) return false;

    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const received = String(signature).replace(/^sha256=/i, '');
    if (expected.length !== received.length) return false;

    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
  }
}

module.exports = {
  AbacatePayClient,
  AbacatePayError
};
