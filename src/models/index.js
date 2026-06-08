const BaseModel = require('./BaseModel');

module.exports = {
  usuarios: new BaseModel('usuarios', ['nome', 'email', 'senha_hash', 'perfil', 'ativo']),
  unidades: new BaseModel('unidades', ['nome', 'sigla']),
  categorias: new BaseModel('categorias', ['nome', 'tipo', 'ativo']),
  fornecedores: new BaseModel('fornecedores', ['nome_empresa', 'nome_contato', 'cnpj', 'telefone', 'email', 'endereco', 'ativo']),
  ingredientes: new BaseModel('ingredientes', ['nome', 'unidade_id', 'fornecedor_id', 'custo_por_unidade', 'estoque_minimo', 'ativo']),
  produtos: new BaseModel('produtos', ['categoria_id', 'nome', 'codigo', 'descricao', 'imagem_url', 'preco_venda', 'custo_total', 'margem_lucro', 'ativo']),
  itensReceita: new BaseModel('itens_receita', ['produto_id', 'ingrediente_id', 'quantidade', 'custo_unitario', 'custo_total']),
  lotesEstoque: new BaseModel('lotes_estoque', ['ingrediente_id', 'fornecedor_id', 'codigo', 'quantidade', 'custo_unitario', 'recebido_em', 'vence_em']),
  movimentacoesEstoque: new BaseModel('movimentacoes_estoque', ['ingrediente_id', 'lote_id', 'tipo', 'quantidade', 'motivo', 'referencia_tipo', 'referencia_id', 'criado_por']),
  mesas: new BaseModel('mesas', ['numero', 'status', 'lugares']),
  pedidos: new BaseModel('pedidos', ['mesa_id', 'nome_cliente', 'status', 'subtotal', 'taxa_atendimento', 'desconto', 'total', 'criado_por', 'fechado_em']),
  itensPedido: new BaseModel('itens_pedido', ['pedido_id', 'produto_id', 'nome', 'quantidade', 'preco_unitario', 'total', 'observacoes', 'status_cozinha']),
  adicionaisItemPedido: new BaseModel('adicionais_item_pedido', ['item_pedido_id', 'nome', 'preco']),
  caixas: new BaseModel('caixas', ['aberto_por', 'fechado_por', 'valor_abertura', 'valor_fechamento', 'status', 'fechado_em']),
  vendas: new BaseModel('vendas', ['pedido_id', 'caixa_id', 'subtotal', 'taxa_atendimento', 'desconto', 'total', 'vendido_por']),
  pagamentos: new BaseModel('pagamentos', ['venda_id', 'pedido_id', 'forma', 'valor', 'status', 'codigo_transacao']),
  cobrancasPix: new BaseModel('cobrancas_pix', ['pedido_id', 'venda_id', 'chave_pix', 'payload', 'valor', 'status', 'pago_em']),
  compras: new BaseModel('compras', ['fornecedor_id', 'status', 'total', 'observacoes']),
  itensCompra: new BaseModel('itens_compra', ['compra_id', 'ingrediente_id', 'quantidade', 'custo_unitario', 'total'])
};
