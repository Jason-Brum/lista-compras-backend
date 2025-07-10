
const express = require("express");
const router = express.Router();
const listaController = require("../controllers/listaController");
const authMiddleware = require("../middlewares/authMiddleware"); // Importe o middleware de autenticação

// GET /listas/:idUsuario – listar listas de um usuário específico
router.get("/:idUsuario", authMiddleware, listaController.listarListasPorUsuario);

// POST /listas – criar nova lista de compras
router.post("/", authMiddleware, listaController.criarLista);

// DELETE /listas/:id – excluir uma lista por ID
router.delete("/:id", authMiddleware, listaController.excluirLista);

// PUT /listas/:id – atualizar uma lista por ID
router.put("/:id/:idLista", authMiddleware, listaController.alterarLista); 

module.exports = router;
