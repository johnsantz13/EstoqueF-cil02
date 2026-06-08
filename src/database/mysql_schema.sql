CREATE DATABASE IF NOT EXISTS estoque_facil
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE estoque_facil;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS itens_compra;
DROP TABLE IF EXISTS compras;
DROP TABLE IF EXISTS cobrancas_pix;
DROP TABLE IF EXISTS pagamentos;
DROP TABLE IF EXISTS vendas;
DROP TABLE IF EXISTS caixas;
DROP TABLE IF EXISTS adicionais_item_pedido;
DROP TABLE IF EXISTS itens_pedido;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS mesas;
DROP TABLE IF EXISTS movimentacoes_estoque;
DROP TABLE IF EXISTS lotes_estoque;
DROP TABLE IF EXISTS itens_receita;
DROP TABLE IF EXISTS produtos;
DROP TABLE IF EXISTS ingredientes;
DROP TABLE IF EXISTS fornecedores;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS unidades;
DROP TABLE IF EXISTS usuarios;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE usuarios (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  perfil ENUM('admin', 'gerente', 'operador', 'cozinha') NOT NULL DEFAULT 'operador',
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE unidades (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(80) NOT NULL,
  sigla VARCHAR(12) NOT NULL UNIQUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE categorias (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(120) NOT NULL UNIQUE,
  tipo ENUM('produto', 'ingrediente') NOT NULL DEFAULT 'produto',
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE fornecedores (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nome_empresa VARCHAR(160) NOT NULL,
  nome_contato VARCHAR(120),
  cnpj VARCHAR(24),
  telefone VARCHAR(32),
  email VARCHAR(160),
  endereco VARCHAR(255),
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_fornecedores_nome_empresa (nome_empresa),
  INDEX idx_fornecedores_cnpj (cnpj)
) ENGINE=InnoDB;

CREATE TABLE ingredientes (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(140) NOT NULL,
  unidade_id BIGINT UNSIGNED,
  fornecedor_id BIGINT UNSIGNED,
  custo_por_unidade DECIMAL(12,2) NOT NULL DEFAULT 0,
  estoque_minimo DECIMAL(12,3) NOT NULL DEFAULT 0,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ingredientes_nome (nome),
  CONSTRAINT fk_ingredientes_unidade FOREIGN KEY (unidade_id) REFERENCES unidades(id),
  CONSTRAINT fk_ingredientes_fornecedor FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id)
) ENGINE=InnoDB;

CREATE TABLE produtos (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  categoria_id BIGINT UNSIGNED,
  nome VARCHAR(160) NOT NULL,
  codigo VARCHAR(60) UNIQUE,
  descricao TEXT,
  imagem_url VARCHAR(255),
  preco_venda DECIMAL(12,2) NOT NULL DEFAULT 0,
  custo_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  margem_lucro DECIMAL(12,2) NOT NULL DEFAULT 0,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_produtos_nome (nome),
  CONSTRAINT fk_produtos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id)
) ENGINE=InnoDB;

CREATE TABLE itens_receita (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  produto_id BIGINT UNSIGNED NOT NULL,
  ingrediente_id BIGINT UNSIGNED NOT NULL,
  quantidade DECIMAL(12,3) NOT NULL,
  custo_unitario DECIMAL(12,2) NOT NULL DEFAULT 0,
  custo_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_itens_receita_produto FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
  CONSTRAINT fk_itens_receita_ingrediente FOREIGN KEY (ingrediente_id) REFERENCES ingredientes(id)
) ENGINE=InnoDB;

CREATE TABLE lotes_estoque (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  ingrediente_id BIGINT UNSIGNED NOT NULL,
  fornecedor_id BIGINT UNSIGNED,
  codigo VARCHAR(80),
  quantidade DECIMAL(12,3) NOT NULL DEFAULT 0,
  custo_unitario DECIMAL(12,2) NOT NULL DEFAULT 0,
  recebido_em DATE,
  vence_em DATE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_lotes_estoque_codigo (codigo),
  CONSTRAINT fk_lotes_estoque_ingrediente FOREIGN KEY (ingrediente_id) REFERENCES ingredientes(id),
  CONSTRAINT fk_lotes_estoque_fornecedor FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id)
) ENGINE=InnoDB;

CREATE TABLE movimentacoes_estoque (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  ingrediente_id BIGINT UNSIGNED NOT NULL,
  lote_id BIGINT UNSIGNED,
  tipo ENUM('entrada', 'saida', 'ajuste', 'perda') NOT NULL,
  quantidade DECIMAL(12,3) NOT NULL,
  motivo VARCHAR(255),
  referencia_tipo VARCHAR(60),
  referencia_id BIGINT UNSIGNED,
  criado_por BIGINT UNSIGNED,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_movimentacoes_estoque_tipo (tipo),
  INDEX idx_movimentacoes_estoque_referencia (referencia_tipo, referencia_id),
  CONSTRAINT fk_movimentacoes_estoque_ingrediente FOREIGN KEY (ingrediente_id) REFERENCES ingredientes(id),
  CONSTRAINT fk_movimentacoes_estoque_lote FOREIGN KEY (lote_id) REFERENCES lotes_estoque(id),
  CONSTRAINT fk_movimentacoes_estoque_usuario FOREIGN KEY (criado_por) REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE TABLE mesas (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  numero VARCHAR(20) NOT NULL UNIQUE,
  status ENUM('disponivel', 'atendimento', 'reserva', 'indisponivel') NOT NULL DEFAULT 'disponivel',
  lugares INT UNSIGNED DEFAULT 4,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE pedidos (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  mesa_id BIGINT UNSIGNED,
  nome_cliente VARCHAR(140),
  status ENUM('aberto', 'preparo', 'pronto', 'fechado', 'cancelado') NOT NULL DEFAULT 'aberto',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  taxa_atendimento DECIMAL(12,2) NOT NULL DEFAULT 0,
  desconto DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  criado_por BIGINT UNSIGNED,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  fechado_em DATETIME,
  INDEX idx_pedidos_status (status),
  CONSTRAINT fk_pedidos_mesa FOREIGN KEY (mesa_id) REFERENCES mesas(id),
  CONSTRAINT fk_pedidos_usuario FOREIGN KEY (criado_por) REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE TABLE itens_pedido (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  pedido_id BIGINT UNSIGNED NOT NULL,
  produto_id BIGINT UNSIGNED,
  nome VARCHAR(160) NOT NULL,
  quantidade INT UNSIGNED NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  status_cozinha ENUM('recebido', 'preparo', 'pronto', 'entregue', 'cancelado') NOT NULL DEFAULT 'recebido',
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_itens_pedido_status_cozinha (status_cozinha),
  CONSTRAINT fk_itens_pedido_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  CONSTRAINT fk_itens_pedido_produto FOREIGN KEY (produto_id) REFERENCES produtos(id)
) ENGINE=InnoDB;

CREATE TABLE adicionais_item_pedido (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  item_pedido_id BIGINT UNSIGNED NOT NULL,
  nome VARCHAR(140) NOT NULL,
  preco DECIMAL(12,2) NOT NULL DEFAULT 0,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_adicionais_item_pedido_item FOREIGN KEY (item_pedido_id) REFERENCES itens_pedido(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE caixas (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  aberto_por BIGINT UNSIGNED,
  fechado_por BIGINT UNSIGNED,
  valor_abertura DECIMAL(12,2) NOT NULL DEFAULT 0,
  valor_fechamento DECIMAL(12,2),
  status ENUM('aberto', 'fechado') NOT NULL DEFAULT 'aberto',
  aberto_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fechado_em DATETIME,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_caixas_aberto_por FOREIGN KEY (aberto_por) REFERENCES usuarios(id),
  CONSTRAINT fk_caixas_fechado_por FOREIGN KEY (fechado_por) REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE TABLE vendas (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  pedido_id BIGINT UNSIGNED,
  caixa_id BIGINT UNSIGNED,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  taxa_atendimento DECIMAL(12,2) NOT NULL DEFAULT 0,
  desconto DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  vendido_por BIGINT UNSIGNED,
  vendido_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_vendas_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  CONSTRAINT fk_vendas_caixa FOREIGN KEY (caixa_id) REFERENCES caixas(id),
  CONSTRAINT fk_vendas_usuario FOREIGN KEY (vendido_por) REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE TABLE pagamentos (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  venda_id BIGINT UNSIGNED,
  pedido_id BIGINT UNSIGNED,
  forma ENUM('pix', 'credito', 'debito', 'dinheiro', 'balcao', 'outro') NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  status ENUM('pendente', 'aprovado', 'recusado', 'cancelado') NOT NULL DEFAULT 'aprovado',
  codigo_transacao VARCHAR(120),
  pago_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pagamentos_forma (forma),
  CONSTRAINT fk_pagamentos_venda FOREIGN KEY (venda_id) REFERENCES vendas(id),
  CONSTRAINT fk_pagamentos_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
) ENGINE=InnoDB;

CREATE TABLE cobrancas_pix (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  pedido_id BIGINT UNSIGNED,
  venda_id BIGINT UNSIGNED,
  chave_pix VARCHAR(160) NOT NULL,
  payload TEXT NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  status ENUM('pendente', 'pago', 'cancelado', 'expirado') NOT NULL DEFAULT 'pendente',
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  pago_em DATETIME,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cobrancas_pix_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  CONSTRAINT fk_cobrancas_pix_venda FOREIGN KEY (venda_id) REFERENCES vendas(id)
) ENGINE=InnoDB;

CREATE TABLE compras (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  fornecedor_id BIGINT UNSIGNED NOT NULL,
  status ENUM('rascunho', 'enviado', 'recebido', 'cancelado') NOT NULL DEFAULT 'rascunho',
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_compras_fornecedor FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id)
) ENGINE=InnoDB;

CREATE TABLE itens_compra (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  compra_id BIGINT UNSIGNED NOT NULL,
  ingrediente_id BIGINT UNSIGNED NOT NULL,
  quantidade DECIMAL(12,3) NOT NULL,
  custo_unitario DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_itens_compra_compra FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
  CONSTRAINT fk_itens_compra_ingrediente FOREIGN KEY (ingrediente_id) REFERENCES ingredientes(id)
) ENGINE=InnoDB;

INSERT INTO usuarios (id, nome, email, senha_hash, perfil) VALUES
  (1, 'Administrador', 'admin@estoquefacil.com', 'trocar-por-hash-gerado-no-backend', 'admin');

INSERT INTO unidades (id, nome, sigla) VALUES
  (1, 'Unidade', 'un'),
  (2, 'Quilograma', 'kg'),
  (3, 'Grama', 'g'),
  (4, 'Litro', 'l'),
  (5, 'Mililitro', 'ml');

INSERT INTO categorias (id, nome, tipo) VALUES
  (1, 'Hamburgueres', 'produto'),
  (2, 'Bebidas', 'produto'),
  (3, 'Acompanhamentos', 'produto'),
  (4, 'Ingredientes', 'ingrediente');

INSERT INTO mesas (numero, status, lugares) VALUES
  ('01', 'disponivel', 4),
  ('02', 'disponivel', 4),
  ('03', 'disponivel', 4),
  ('04', 'disponivel', 4),
  ('05', 'disponivel', 4);

INSERT INTO produtos (categoria_id, nome, codigo, descricao, imagem_url, preco_venda, custo_total, margem_lucro) VALUES
  (1, 'Hamburguer Classico', 'HB001', 'Pao brioche, carne 180g, queijo, alface e tomate.', '/imagens/cards/burguerClassico.jpg', 21.90, 0, 21.90),
  (3, 'Batata Frita', 'AC001', 'Porcao generosa de batatas crocantes com sal especial.', '/imagens/cards/batata-frita.webp', 12.90, 0, 12.90),
  (2, 'Coca-Cola Lata', 'BB001', '350ml, gelada.', '/imagens/cards/cocalata.webp', 5.00, 0, 5.00);
