const db = require("../db/connection"); // Este 'db' agora é promise-compatible

const categoriaController = {
  listarCategorias: async (req, res) => { 
    try {
      const [results] = await db.query("SELECT * FROM categoria"); 

      res.json(results);
    } catch (err) { // Capture o erro do await
      console.error("Erro ao listar categorias:", err);
      return res.status(500).json({ erro: "Erro ao buscar categorias" });
    }
  },

  criarCategoria: async (req, res) => { 
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({ erro: "O nome da categoria é obrigatório." });
    }

    const query = "INSERT INTO categoria (nome) VALUES (?)";
    try {
      // Use await para a inserção
      const [result] = await db.query(query, [nome]);

      res.status(201).json({
        mensagem: "Categoria criada com sucesso",
        id: result.insertId,
        nome
      });
    } catch (err) { // Capture o erro do await
      console.error("Erro ao criar categoria:", err);
      return res.status(500).json({ erro: "Erro ao criar categoria" });
    }
  }
};

module.exports = categoriaController;