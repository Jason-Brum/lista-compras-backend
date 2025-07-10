CREATE DATABASE IF NOT EXISTS lista_compras;
USE lista_compras;

-- Tabela de usuários
CREATE TABLE usuario (
    idUsuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(45) NOT NULL,
    email VARCHAR(45),
    cpf VARCHAR(11)
);items

-- Tabela de listas de compras
CREATE TABLE lista_de_compras (
    idLista INT AUTO_INCREMENT PRIMARY KEY,
    dataDeCriacao DATE NOT NULL,
    tema VARCHAR(45),
    nomeDaLista VARCHAR(45),
    usuario INT,
    FOREIGN KEY (usuario) REFERENCES usuario(idUsuario) ON DELETE SET NULL
);

-- Tabela de categorias
CREATE TABLE categoria (
    idCategoria INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(45) NOT NULL
);

-- Tabela de itens
CREATE TABLE item (
    idItem INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(45) NOT NULL,
    quantidade FLOAT,
    idCategoria INT,
    idLista INT,
    FOREIGN KEY (idCategoria) REFERENCES categoria(idCategoria) ON DELETE SET NULL,
    FOREIGN KEY (idLista) REFERENCES lista_de_compras(idLista) ON DELETE CASCADE
);
