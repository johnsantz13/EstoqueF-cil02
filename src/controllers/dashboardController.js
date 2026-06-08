const database = require('../config/database');

async function summary(req, res, next) {
  try {
    const [
      products,
      ingredients,
      openOrders,
      todaySales,
      lowStock
    ] = await Promise.all([
      database.get('SELECT COUNT(*) AS total FROM produtos WHERE ativo = 1'),
      database.get('SELECT COUNT(*) AS total FROM ingredientes WHERE ativo = 1'),
      database.get("SELECT COUNT(*) AS total FROM pedidos WHERE status IN ('aberto', 'preparo')"),
      database.get('SELECT COALESCE(SUM(total), 0) AS total FROM vendas WHERE DATE(vendido_em) = CURDATE()'),
      database.all(`
        SELECT i.id, i.nome, i.estoque_minimo,
               COALESCE(SUM(CASE
                 WHEN me.tipo = 'entrada' THEN me.quantidade
                 WHEN me.tipo IN ('saida', 'perda') THEN -me.quantidade
                 WHEN me.tipo = 'ajuste' THEN me.quantidade
                 ELSE 0
               END), 0) AS estoque_atual
        FROM ingredientes i
        LEFT JOIN movimentacoes_estoque me ON me.ingrediente_id = i.id
        WHERE i.ativo = 1
        GROUP BY i.id
        HAVING estoque_atual <= i.estoque_minimo
        ORDER BY i.nome
        LIMIT 10
      `)
    ]);

    res.json({
      produtos: products.total,
      ingredientes: ingredients.total,
      pedidos_abertos: openOrders.total,
      total_vendas_hoje: todaySales.total,
      estoque_baixo: lowStock
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  summary
};
