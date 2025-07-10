const db = require("../db/connection"); // Este 'db' agora é promise-compatible

const listaController = {
  // Listar listas de um usuário específico
  // O idUsuario vem do token (req.user.idUsuario), não do req.params
  listarListasPorUsuario: async (req, res) => {
    const idUsuarioAutenticado = req.user.idUsuario; // Pega o id do usuário do token (middleware)

    try {
      const [results] = await db.query("SELECT * FROM lista_de_compras WHERE idUsuario = ?", [idUsuarioAutenticado]);
      res.json(results);
    } catch (err) {
      console.error("Erro ao listar listas do usuário:", err);
      return res.status(500).json({ erro: "Erro ao buscar listas do usuário" });
    }
  },

  // Criar nova lista
  criarLista: async (req, res) => {
    const { nomeDaLista, tema } = req.body;
    const idUsuarioAutenticado = req.user.idUsuario; // Pega o id do usuário do token (middleware)
    const dataDeCriacao = new Date().toISOString().split('T')[0]; // Define a data de criação no backend

    if (!nomeDaLista) {
      return res.status(400).json({ erro: "O nome da lista é obrigatório." });
    }

    const query = `
      INSERT INTO lista_de_compras (dataDeCriacao, tema, nomeDaLista, idUsuario)
      VALUES (?, ?, ?, ?)
    `;

    try {
      const [result] = await db.query(query, [dataDeCriacao, tema || null, nomeDaLista, idUsuarioAutenticado]);

      res.status(201).json({
        mensagem: "Lista criada com sucesso",
        idLista: result.insertId,
        dataDeCriacao,
        tema: tema || null, // Garante que tema seja null se não fornecido
        nomeDaLista,
        idUsuario: idUsuarioAutenticado // Retorna o ID do usuário autenticado
      });
    } catch (err) {
      console.error("Erro ao criar lista:", err);
      return res.status(500).json({ erro: "Erro ao criar lista de compras" });
    }
  },

  // Excluir uma lista por ID
  excluirLista: async (req, res) => {
    const { id } = req.params; // id aqui se refere ao idLista na URL da rota
    const idUsuarioAutenticado = req.user.idUsuario; // Pega o id do usuário do token (middleware)

    if (!id) {
        return res.status(400).json({ erro: "O ID da lista é obrigatório." });
    }

    const query = "DELETE FROM lista_de_compras WHERE idLista = ? AND idUsuario = ?"; // Adiciona segurança
    try {
      const [result] = await db.query(query, [id, idUsuarioAutenticado]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ erro: "Lista não encontrada ou você não tem permissão para excluí-la." });
      }

      res.status(200).json({ mensagem: "Lista excluída com sucesso" });
    } catch (err) {
      console.error("Erro ao excluir lista:", err);
      return res.status(500).json({ erro: "Erro ao excluir lista de compras" });
    }
  },

  // Alterar uma lista por ID
  alterarLista: async (req, res) => {
    const { idLista } = req.params; // idLista vem da URL da rota (ex: /listas/123)
    const { nomeDaLista } = req.body;
    const idUsuarioAutenticado = req.user.idUsuario; // Pega o id do usuário do token (middleware)

    if (!idLista || !nomeDaLista) {
      return res.status(400).json({ erro: "ID da lista e nomeDaLista são obrigatórios." });
    }

    const query = "UPDATE lista_de_compras SET nomeDaLista = ? WHERE idLista = ? AND idUsuario = ?"; // Adiciona segurança
    try {
      const [result] = await db.query(query, [nomeDaLista, idLista, idUsuarioAutenticado]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ erro: "Lista não encontrada ou você não tem permissão para alterá-la." });
      }

      res.status(200).json({ mensagem: "Lista alterada com sucesso" });
    } catch (err) {
      console.error("Erro ao alterar lista:", err);
      return res.status(500).json({ erro: "Erro ao alterar lista de compras" });
    }
  }
};

module.exports = listaController;