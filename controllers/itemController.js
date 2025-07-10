const db = require("../db/connection"); // Este 'db' agora é promise-compatible

const itemController = {
  // Buscar todos os itens (idealmente, apenas os do usuário autenticado)
  getAllItems: async (req, res) => {
    const idUsuarioAutenticado = req.user.idUsuario; // Pega o id do usuário do token

    try {
      // Buscar todos os itens que pertencem às listas do usuário autenticado
      // Isso requer um JOIN com a tabela lista_de_compras
      const query = `
        SELECT i.idItem, i.nome, i.quantidade, i.estado, i.dataCompra, i.idCategoria, i.idLista, c.nome as dsCategoria 
        FROM item i
        JOIN lista_de_compras l ON i.idLista = l.idLista
        JOIN categoria c ON i.idCategoria = c.idCategoria
        WHERE l.idUsuario = ?
        ORDER BY i.idLista, i.nome ASC;
      `;
      const [results] = await db.query(query, [idUsuarioAutenticado]);

      const retorno = results.map(item => ({
        idItem: item.idItem,
        nome: item.nome,
        quantidade: item.quantidade,
        estado: item.estado,
        dataCompra: item.dataCompra,
        idCategoria: item.idCategoria,
        idLista: item.idLista,
        dsCategoria: item.dsCategoria,
        isCompleted: item.estado === 'COMPLETO'
      }));
      res.json(retorno);
    } catch (err) {
      console.error("Erro ao buscar todos os itens do usuário:", err);
      return res.status(500).json({ erro: "Erro ao buscar todos os itens." });
    }
  },

  // Buscar itens por ID da lista
  getItemsByLista: async (req, res) => {
    const { idLista } = req.params;
    const idUsuarioAutenticado = req.user.idUsuario; // Pega o id do usuário do token

    if (isNaN(idLista)) {
      return res.status(400).json({ erro: "ID da lista inválido" });
    }

    try {
      // Primeiro, verificar se a lista pertence ao usuário autenticado
      const [listas] = await db.query('SELECT idLista FROM lista_de_compras WHERE idLista = ? AND idUsuario = ?', [idLista, idUsuarioAutenticado]);
      if (listas.length === 0) {
        return res.status(403).json({ erro: "Lista não encontrada ou você não tem permissão para acessar esta lista." });
      }

      // Agora, buscar os itens daquela lista específica
      const query = `
        SELECT i.idItem, i.nome, i.quantidade, i.estado, i.dataCompra, i.idCategoria, i.idLista, c.nome as dsCategoria 
        FROM item i
        JOIN categoria c ON i.idCategoria = c.idCategoria 
        WHERE i.idLista = ? 
        ORDER BY i.estado ASC, i.nome ASC; -- Ordenei para mostrar completos no final e depois por nome
      `;
      const [results] = await db.query(query, [idLista]);

      const retorno = results.map(item => ({
        idItem: item.idItem,
        nome: item.nome,
        quantidade: item.quantidade,
        estado: item.estado,
        dataCompra: item.dataCompra,
        idCategoria: item.idCategoria,
        idLista: item.idLista,
        dsCategoria: item.dsCategoria,
        isCompleted: item.estado === 'COMPLETO'
      }));
      res.json(retorno);
    } catch (err) {
      console.error("Erro ao buscar itens por lista:", err);
      return res.status(500).json({ erro: "Erro ao buscar itens da lista." });
    }
  },

  // Adicionar novo item
  addItem: async (req, res) => {
    const { nome, quantidade, idCategoria, idLista } = req.body;
    const idUsuarioAutenticado = req.user.idUsuario; // Pega o id do usuário do token

    if (!nome || !quantidade || !idCategoria || !idLista) {
      return res.status(400).json({ erro: "Todos os campos do item são obrigatórios." });
    }

    try {
      // Primeiro, verificar se a idLista fornecida pertence ao usuário autenticado
      const [listas] = await db.query('SELECT idLista FROM lista_de_compras WHERE idLista = ? AND idUsuario = ?', [idLista, idUsuarioAutenticado]);
      if (listas.length === 0) {
        return res.status(403).json({ erro: "Lista não encontrada ou você não tem permissão para adicionar itens a ela." });
      }

      const query = `
        INSERT INTO item (nome, quantidade, idCategoria, idLista, estado, dataCompra)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      // Adicionei estado e dataCompra com valores padrão no backend
      const estadoPadrao = 'PENDENTE';
      const dataCompraPadrao = new Date().toISOString().split('T')[0]; // Data atual no formato YYYY-MM-DD

      const [result] = await db.query(query, [nome, quantidade, idCategoria, idLista, estadoPadrao, dataCompraPadrao]);

      // Retorna o item recém-criado com o ID e valores padrão
      const newItem = {
        idItem: result.insertId,
        nome,
        quantidade,
        idCategoria,
        idLista,
        estado: estadoPadrao,
        dataCompra: dataCompraPadrao,
        isCompleted: false,
      };

      res.status(201).json(newItem);
    } catch (err) {
      console.error("Erro ao adicionar item:", err);
      return res.status(500).json({ erro: "Erro ao adicionar item." });
    }
  },

  // Deletar item
  deleteItem: async (req, res) => {
    const { id } = req.params; // id aqui é idItem
    const idUsuarioAutenticado = req.user.idUsuario; // Pega o id do usuário do token

    if (isNaN(id)) {
        return res.status(400).json({ erro: "ID do item inválido" });
    }

    try {
      // Primeiro, verificar se o item pertence a uma lista do usuário autenticado
      const [items] = await db.query(`
        SELECT i.idItem FROM item i
        JOIN lista_de_compras l ON i.idLista = l.idLista
        WHERE i.idItem = ? AND l.idUsuario = ?
      `, [id, idUsuarioAutenticado]);

      if (items.length === 0) {
        return res.status(403).json({ erro: "Item não encontrado ou você não tem permissão para excluí-lo." });
      }

      const query = "DELETE FROM item WHERE idItem = ?";
      const [result] = await db.query(query, [id]);

      // result.affectedRows deve ser 1 se o item foi deletado
      if (result.affectedRows === 0) {
          // Isso raramente acontece se o item foi encontrado na verificação anterior,
          // mas é um fallback.
          return res.status(404).json({ erro: "Item não encontrado." });
      }

      console.log(`Item com ID ${id} deletado com sucesso.`);
      res.status(200).json({ mensagem: "Item excluído com sucesso", idItem: id }); // Retorna 200 com mensagem
    } catch (err) {
      console.error("Erro ao deletar item:", err);
      return res.status(500).json({ erro: "Erro ao deletar item." });
    }
  },

  // Deletar todos os itens por ID da lista
  deleteItemByIdLista: async (req, res) => {
    const { idLista } = req.params;
    const idUsuarioAutenticado = req.user.idUsuario; // Pega o id do usuário do token

    if (isNaN(idLista)) {
        return res.status(400).json({ erro: "ID da lista inválido" });
    }

    try {
      // Primeiro, verificar se a lista pertence ao usuário autenticado
      const [listas] = await db.query('SELECT idLista FROM lista_de_compras WHERE idLista = ? AND idUsuario = ?', [idLista, idUsuarioAutenticado]);
      if (listas.length === 0) {
        return res.status(403).json({ erro: "Lista não encontrada ou você não tem permissão para limpar esta lista." });
      }

      const query = "DELETE FROM item WHERE idLista = ?";
      const [result] = await db.query(query, [idLista]);

      console.log(`Item(s) com IdLista ${idLista} deletado(s) com sucesso. ${result.affectedRows} linhas afetadas.`);
      res.status(200).json({ mensagem: "Itens da lista excluídos com sucesso", idLista: idLista, affectedRows: result.affectedRows });
    } catch (err) {
      console.error("Erro ao deletar itens por ID da lista:", err);
      return res.status(500).json({ erro: "Erro ao deletar itens da lista." });
    }
  },

  // Adicionar ou remover um item da lista (marcar como completo/pendente)
  toggleItemState: async (req, res) => {
    const { id } = req.params; // id aqui é idItem
    const { estado } = req.body; // 'COMPLETO' ou 'PENDENTE'
    const idUsuarioAutenticado = req.user.idUsuario;

    if (isNaN(id) || !estado || !['COMPLETO', 'PENDENTE'].includes(estado)) {
      return res.status(400).json({ erro: "ID do item ou estado inválido." });
    }

    try {
      // Verificar se o item pertence a uma lista do usuário autenticado
      const [items] = await db.query(`
        SELECT i.idItem FROM item i
        JOIN lista_de_compras l ON i.idLista = l.idLista
        WHERE i.idItem = ? AND l.idUsuario = ?
      `, [id, idUsuarioAutenticado]);

      if (items.length === 0) {
        return res.status(403).json({ erro: "Item não encontrado ou você não tem permissão para alterar seu estado." });
      }

      const query = "UPDATE item SET estado = ? WHERE idItem = ?";
      const [result] = await db.query(query, [estado, id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ erro: "Item não encontrado." });
      }

      res.status(200).json({ mensagem: `Estado do item ${id} atualizado para ${estado}.` });

    } catch (err) {
      console.error("Erro ao alterar estado do item:", err);
      return res.status(500).json({ erro: "Erro ao alterar estado do item." });
    }
  },
};

module.exports = itemController;