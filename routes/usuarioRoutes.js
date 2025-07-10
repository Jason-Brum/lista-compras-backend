const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const { body } = require("express-validator");

// Listar usuários
router.get("/", usuarioController.listarUsuarios);

// Criar usuário com validação
router.post(
  "/",
  [
    body("nome").notEmpty().withMessage("Nome é obrigatório"),
    body("email").isEmail().withMessage("E-mail inválido"),
    body("cpf").isLength({ min: 11, max: 11 }).withMessage("CPF deve ter 11 dígitos"),
    body("senha").isLength({ min: 6 }).withMessage("Senha deve ter pelo menos 6 caracteres"),
    body("dataCadastro").isDate().withMessage("Data de cadastro inválida")
  ],
  usuarioController.criarUsuario
);

module.exports = router;
