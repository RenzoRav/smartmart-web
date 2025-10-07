# SmartMart Web — Controle de Estoque (Nuxt + Supabase)

> Uma aplicação **SPA** para controle simples de estoque, com cadastro de produtos, categorias e movimentações de entrada/saída.
> OBS: Para fazer o login bastar inserir qualquer coisa em ambos os campos.

---

## Visão Geral
O **SmartMart Web** é um projeto acadêmico desenvolvido com **Nuxt 4** e **Supabase** que oferece um painel simples para gestão de estoque. O foco é praticar front-end moderno (Vue 3 + PrimeVue) consumindo um BaaS (Supabase) sem a necessidade de um backend próprio.

---

## Deploy
- **GitHub Pages:** https://renzorav.github.io/smartmart-web/

> OBS: o projeto é gerado estaticamente e publicado no Pages. O `baseURL` do Nuxt está configurado para `/smartmart-web/` em produção.

---

## Funcionalidades
- **Dashboard:** métricas rápidas (produtos ativos/inativos, saldo do período), top movimentados e últimos movimentos.
- **Produtos:** CRUD com nome, SKU, preço, custo, status e **categoria**.
- **Categorias:** cadastro e associação com produtos.
- **Movimentos de Estoque:** registro de **ENTRADA** e **SAÍDA** (compra, venda, devolução, ajuste, etc.).
- **Usuários:** gerenciamento simples (username, senha, papel) para fins acadêmicos.

---

## Tecnologias
- **Framework:** Nuxt 4 (SPA), Vue 3
- **UI:** PrimeVue, PrimeIcons, Tailwind (via Vite plugin)
- **BaaS:** Supabase 
- **Build/Dev:** Vite, TypeScript 
- **Deploy:** GitHub Pages

---

## Modelo Logico

<img width="1241" height="691" alt="image" src="https://github.com/user-attachments/assets/4bd750cd-c025-4051-aa5a-aa7a42c40881" />

> As print da aplicação esta dentro de img/prints

