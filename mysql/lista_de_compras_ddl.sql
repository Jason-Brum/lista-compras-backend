CREATE DATABASE IF NOT EXISTS lista_compras;
USE lista_compras;

-- Tabela de usuários
CREATE TABLE usuario (
  idUsuario INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  cpf VARCHAR(11) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  dataCadastro DATE NOT NULL
);

-- Tabela de listas de compras
CREATE TABLE lista_de_compras (
  idLista INT AUTO_INCREMENT PRIMARY KEY,
  dataDeCriacao DATE NOT NULL,
  tema VARCHAR(45),
  nomeDaLista VARCHAR(100) NOT NULL,
  idUsuario INT,
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario) ON DELETE CASCADE
);

-- Tabela de categorias
CREATE TABLE categoria (
    idCategoria INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(45) NOT NULL
);

-- Tabela de itens
CREATE TABLE item (
  idItem INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  quantidade FLOAT NOT NULL,
  estado ENUM('pendente', 'comprado') DEFAULT 'pendente',
  dataCompra DATE,
  idCategoria INT,
  idLista INT,
  FOREIGN KEY (idCategoria) REFERENCES categoria(idCategoria) ON DELETE SET NULL,
  FOREIGN KEY (idLista) REFERENCES lista(idLista) ON DELETE CASCADE
);
