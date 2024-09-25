-- init/init.sql

-- Criação do banco de dados (opcional, pois já está sendo criado pelo POSTGRES_DB)
-- CREATE DATABASE backend;

-- Criação do usuário e atribuição de privilégios
CREATE USER esp WITH PASSWORD 'esp';
GRANT ALL PRIVILEGES ON DATABASE backend TO esp;
