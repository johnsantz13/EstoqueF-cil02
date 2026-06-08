# Banco MySQL do Estoque Facil

O schema completo para MySQL Workbench esta em:

```text
src/database/mysql_schema.sql
```

## Como criar pelo MySQL Workbench

1. Abra o MySQL Workbench.
2. Entre na sua conexao local do MySQL Server.
3. Va em `File > Open SQL Script`.
4. Abra `src/database/mysql_schema.sql`.
5. Clique no raio de execucao.
6. Atualize a lista de schemas.

O banco criado se chama:

```text
estoque_facil
```

## Como criar pelo backend

Crie um arquivo `.env` na raiz do projeto:

```text
PORT=3000
APP_SECRET=troque-esta-chave-em-producao
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=sua_senha_do_mysql
MYSQL_DATABASE=estoque_facil
```

Depois rode:

```bash
npm run db:init
npm start
```

Se a senha estiver correta, o backend cria o schema no MySQL e passa a usar esse banco.

## O que esta incluso

- `usuarios`
- `unidades`
- `categorias`
- `fornecedores`
- `ingredientes`
- `produtos`
- `itens_receita`
- `lotes_estoque`
- `movimentacoes_estoque`
- `mesas`
- `pedidos`
- `itens_pedido`
- `adicionais_item_pedido`
- `caixas`
- `vendas`
- `pagamentos`
- `cobrancas_pix`
- `compras`
- `itens_compra`

## Usuario inicial

```text
admin@estoquefacil.com
```

O backend ajusta o hash desse usuario ao rodar `npm run db:init`.
