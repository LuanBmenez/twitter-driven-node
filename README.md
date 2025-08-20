# Tweteroo Backend

Este é o backend de uma aplicação de microblog inspirada no Twitter, desenvolvida com Node.js, Express e MongoDB.

## Funcionalidades
- Cadastro de usuário (`POST /sign-up`)
- Cadastro de tweet (`POST /tweets`)
- Listagem de todos os tweets com avatar (`GET /tweets`)
- Listagem de tweets de um usuário específico (`GET /tweets/:username`)
- Edição de tweet (`PUT /tweets/:id`)
- Exclusão de tweet (`DELETE /tweets/:id`)

## Como rodar
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o arquivo `.env`:
   - Crie um arquivo `.env` baseado no `.env.example`.
   - Exemplo:
     ```env
     DATABASE_URL=mongodb://127.0.0.1:27017/twitterdb
     PORT=5000
     ```
3. Inicie o servidor:
   ```bash
   npm start
   ```

## Estrutura
- `src/index.js`: Arquivo principal da API
- `src/app.js`: (opcional) pode conter configurações adicionais
- `package.json`: Dependências e scripts

## Requisitos
- Node.js
- MongoDB rodando localmente ou em nuvem

## Observações
- O arquivo `.env` está no `.gitignore` por segurança. Use `.env.example` como referência.
- O backend está preparado para integração com frontend via CORS.

## Autor
LuanBmenez

---
Sinta-se livre para contribuir ou abrir issues!
