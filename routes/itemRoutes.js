const express = require("express");
const router = express.Router();
// Correção aqui: Importe o objeto itemController inteiro
const itemController = require("../controllers/itemController"); // <-- Mude para importar o objeto completo

const authMiddleware = require("../middlewares/authMiddleware");

// Defina as rotas para os itens:
router.get("/", authMiddleware, itemController.getAllItems); 

// GET /items/lista/:idLista – listar itens de uma lista específica
router.get("/lista/:idLista", authMiddleware, itemController.getItemsByLista); // Protegido

// POST /items – adicionar novo item
router.post("/", authMiddleware, itemController.addItem); // Protegido

// DELETE /items/:id – excluir um item por ID
router.delete("/:id", authMiddleware, itemController.deleteItem); // Protegido

// DELETE /items/lista/:idLista – excluir todos os itens de uma lista por ID da lista
router.delete("/lista/:idLista", authMiddleware, itemController.deleteItemByIdLista); // Protegido

// NOVO: Rota para alternar o estado do item (marcar como completo/pendente)
router.put("/toggle-state/:id", authMiddleware, (req, res, next) => {
    console.log(`[ItemRoutes] Requisição PUT /items/toggle-state/:id recebida para ID: ${req.params.id}`);
    next(); // Passa para o próximo middleware/controlador
}, itemController.toggleItemState); // Agora itemController está definido

module.exports = router;