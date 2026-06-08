const database = require('../config/database');

class BaseModel {
  constructor(table, fillable) {
    this.table = table;
    this.fillable = fillable;
  }

  async findAll({ limit = 100, offset = 0 } = {}) {
    const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 1000));
    const safeOffset = Math.max(0, Number(offset) || 0);

    return database.all(
      `SELECT * FROM ${this.table} ORDER BY id DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`
    );
  }

  async findById(id) {
    return database.get(`SELECT * FROM ${this.table} WHERE id = ?`, [id]);
  }

  async create(payload) {
    const data = this.onlyFillable(payload);
    const keys = Object.keys(data);
    if (keys.length === 0) {
      const error = new Error('Nenhum campo valido informado.');
      error.status = 400;
      throw error;
    }

    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map((key) => data[key]);
    const result = await database.run(
      `INSERT INTO ${this.table} (${keys.join(', ')}) VALUES (${placeholders})`,
      values
    );
    return this.findById(result.id);
  }

  async update(id, payload) {
    const data = this.onlyFillable(payload);
    const keys = Object.keys(data);
    if (keys.length === 0) {
      const error = new Error('Nenhum campo valido informado.');
      error.status = 400;
      throw error;
    }

    const assignments = keys.map((key) => `${key} = ?`).join(', ');
    const values = keys.map((key) => data[key]);
    values.push(id);

    await database.run(
      `UPDATE ${this.table} SET ${assignments}, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    return this.findById(id);
  }

  async remove(id) {
    const result = await database.run(`DELETE FROM ${this.table} WHERE id = ?`, [id]);
    return { deleted: result.changes > 0 };
  }

  onlyFillable(payload) {
    return this.fillable.reduce((data, field) => {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        data[field] = payload[field];
      }
      return data;
    }, {});
  }
}

module.exports = BaseModel;

