#!/bin/bash

# Navega para a raiz do projeto (onde está o docker-compose)
cd "$(dirname "$0")/.."

docker compose -f docker/docker-compose.yaml exec -it db \
  env PGPASSWORD=postgres psql -U postgres -d streaming


# Acessa o banco PostgreSQL do projeto via Docker.
# Uso: ./scripts/acessar_banco.sh
#
# ═══════════════════════════════════════════════════════════════════════════════
# PRINCIPAIS COMANDOS DO PSQL (PostgreSQL)
# ═══════════════════════════════════════════════════════════════════════════════
#
# Tabelas:
#   \dt                  Lista tabelas do schema public
#   \dt *.*              Lista todas as tabelas de todos os schemas
#   \d nome_tabela       Mostra estrutura da tabela (colunas, tipos)
#   \d+ nome_tabela      Estrutura detalhada (com tamanhos, etc)
#
# Schemas e databases:
#   \dn                  Lista schemas
#   \l                   Lista databases
#   \c nome_banco        Conecta a outro database
#
# Índices e funções:
#   \di                  Lista índices
#   \df                  Lista funções
#
# Navegação:
#   \?                   Ajuda dos comandos do psql
#   \h                   Ajuda dos comandos SQL
#   \q                   Sai do psql
#
# SQL (exemplos):
#   SELECT * FROM accounts LIMIT 10;
#   INSERT INTO accounts (name, email, ...) VALUES (...);
#
# ═══════════════════════════════════════════════════════════════════════════════