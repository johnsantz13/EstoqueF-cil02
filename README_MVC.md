# Estoque Facil MVC

Esta versao adiciona uma camada MVC ao projeto existente, sem remover as telas HTML atuais.

## Estrutura

- `server.js`: ponto de entrada do servidor.
- `src/app.js`: configuracao do Express, API e arquivos estaticos.
- `src/config/database.js`: conexao MySQL e inicializacao do banco.
- `src/database/mysql_schema.sql`: schema completo do banco MySQL.
- `src/models`: modelos de acesso aos dados.
- `src/controllers`: regras de entrada/saida das rotas.
- `src/routes`: definicao das rotas HTTP.
- `src/database/mysql_schema.sql`: script compativel com MySQL Workbench.

## Como rodar

```bash
npm install
npm run db:init
npm start
```

Acesse:

```text
http://localhost:3000
```

Usuario inicial da API:

```text
email: admin@estoquefacil.com
senha: 1234
```

## Rotas principais

Todas retornam JSON.

```text
GET    /api/health
POST   /api/autenticacao/registrar
POST   /api/autenticacao/entrar
GET    /api/autenticacao/eu
GET    /api/dashboard/summary
```

Rotas CRUD no mesmo padrao:

```text
GET    /api/produtos
GET    /api/produtos/:id
POST   /api/produtos
PUT    /api/produtos/:id
PATCH  /api/produtos/:id
DELETE /api/produtos/:id
```

Recursos disponiveis:

```text
/api/usuarios
/api/unidades
/api/categorias
/api/fornecedores
/api/ingredientes
/api/produtos
/api/itens-receita
/api/lotes-estoque
/api/movimentacoes-estoque
/api/mesas
/api/pedidos
/api/itens-pedido
/api/adicionais-item-pedido
/api/caixas
/api/vendas
/api/pagamentos
/api/cobrancas-pix
/api/compras
/api/itens-compra
```

## Banco de dados

O backend usa MySQL Server, o mesmo servidor que voce acessa pelo MySQL Workbench.
Crie um arquivo `.env` na raiz do projeto usando o modelo de `.env.example`:

```text
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=sua_senha_do_mysql
MYSQL_DATABASE=estoque_facil
```

O schema cobre:

- usuarios e autenticacao;
- unidades e categorias;
- fornecedores;
- ingredientes;
- produtos;
- ficha tecnica/receita;
- lotes e movimentacoes de estoque;
- mesas;
- pedidos e itens;
- painel da cozinha via status dos itens;
- caixa;
- vendas;
- pagamentos;
- cobrancas PIX;
- pedidos de compra.

## Observacao importante

As telas antigas ainda possuem bastante logica em `localStorage`. O login e o cadastro ja foram ligados na API, mas a migracao total de cada tela para usar `/api/...` deve ser feita por modulo: estoque, produtos, fornecedores, mesas, PDV e cozinha.
