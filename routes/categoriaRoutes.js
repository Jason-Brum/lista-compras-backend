const express = require("express");
const router = express.Router();
const categoriaController = require("../controllers/categoriaController");

// GET /categorias – listar todas as categorias
router.get("/", categoriaController.listarCategorias);

// POST /categorias – criar uma nova categoria
router.post("/", categoriaController.criarCategoria);

module.exports = router;
