const express = require("express");
const router = express.Router();
// Importe o authController inteiro para acessar as novas funções
const authController = require("../controllers/authController"); 
const authMiddleware = require("../middlewares/authMiddleware");

// Rotas de autenticação existentes
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.put("/profile", authMiddleware, authController.updateProfile);

// NOVO: Rota para solicitar redefinição de senha
router.post("/forgot-password", authController.forgotPassword); // Não é protegida por authMiddleware

// NOVO: Rota para redefinir a senha com um token
router.post("/reset-password/:token", authController.resetPassword); // Não é protegida por authMiddleware

module.exports = router;