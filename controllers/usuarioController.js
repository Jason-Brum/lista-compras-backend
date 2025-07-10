const db = require("../db/connection");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

const usuarioController = {
  // CORREÇÃO AQUI: Converter para async/await
  listarUsuarios: async (req, res) => { // Adicionar 'async' aqui
    try {
      // Usar await para a query. db.query() já retorna uma Promise.
      const [results] = await db.query('SELECT idUsuario, nome, email, cpf, dataCadastro FROM usuario');
      res.json(results);
    } catch (err) { // Capturar o erro do await
      console.error('Erro ao listar usuários:', err);
      // Sempre retornar JSON em caso de erro
      return res.status(500).json({ erro: 'Erro ao buscar usuários' });
    }
  },

  criarUsuario: async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }

    const { nome, email, cpf, senha, dataCadastro } = req.body;

    try {
      const [verifica] = await db.query( // Usar db.query() diretamente
        "SELECT * FROM usuario WHERE email = ? OR cpf = ?",
        [email, cpf]
      );

      if (verifica.length > 0) {
        return res.status(400).json({ erro: "E-mail ou CPF já cadastrados." });
      }

      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(senha, salt);

      const [result] = await db.query( // Usar db.query() diretamente
        "INSERT INTO usuario (nome, email, cpf, senha, dataCadastro) VALUES (?, ?, ?, ?, ?)",
        [nome, email, cpf, senhaHash, dataCadastro]
      );

      res.status(201).json({
        mensagem: "Usuário criado com sucesso",
        id: result.insertId
      });

    } catch (err) {
      console.error("Erro ao criar usuário:", err);
      res.status(500).json({ erro: "Erro interno ao criar usuário" });
    }
  }
};

module.exports = usuarioController;