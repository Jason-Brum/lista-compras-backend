const db = require("../db/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer"); // Já importado

require("dotenv").config();

// Função auxiliar para gerar o JWT (já existente)
const generateToken = (idUsuario) => {
  return jwt.sign({ idUsuario }, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });
};

// Configurar o transportador de e-mail fora das funções para reutilização
// Este será o objeto que envia os e-mails
const transporter = nodemailer.createTransport({
  service: "gmail", // Usar serviço Gmail
  auth: {
    user: process.env.EMAIL_USER,         // Seu e-mail do Gmail (do .env)
    pass: process.env.EMAIL_APP_PASSWORD, // Sua senha de aplicativo gerada (do .env)
  },
});

const authController = {
  registerUser: async (req, res) => {
    const { nome, email, cpf, senha } = req.body;

    if (!nome || !email || !cpf || !senha) {
      return res.status(400).json({ error: "Preencha todos os campos." });
    }

    try {
      const [userExist] = await db.query(
        "SELECT * FROM usuario WHERE email = ? OR cpf = ?",
        [email, cpf]
      );

      if (userExist.length > 0) {
        return res.status(409).json({ error: "Usuário já existe com este email ou CPF." });
      }

      const hashedPassword = await bcrypt.hash(senha, 10);
      const dataCadastro = new Date();

      const [result] = await db.query(
        "INSERT INTO usuario (nome, email, cpf, senha, dataCadastro) VALUES (?, ?, ?, ?, ?)",
        [nome, email, cpf, hashedPassword, dataCadastro]
      );

      const newUserId = result.insertId;
      const token = generateToken(newUserId);

      res.status(201).json({
        message: "Usuário registrado com sucesso e logado!",
        token,
        user: { idUsuario: newUserId, nome, email, cpf },
      });
    } catch (err) {
      console.error("Erro no registro:", err);
      res.status(500).json({ error: "Erro ao registrar usuário." });
    }
  },

  loginUser: async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "Informe o email e a senha." });
    }

    try {
      const [rows] = await db.query("SELECT * FROM usuario WHERE email = ?", [email]);
      const user = rows[0];

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado." });
      }

      const isPasswordValid = await bcrypt.compare(senha, user.senha);

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Senha incorreta." });
      }

      const token = generateToken(user.idUsuario);

      res.json({ token, user: { idUsuario: user.idUsuario, nome: user.nome, email: user.email, cpf: user.cpf } });
    } catch (err) {
      console.error("Erro no login:", err);
      res.status(500).json({ error: "Erro ao fazer login." });
    }
  },

  updateProfile: async (req, res) => {
    const userId = req.user.idUsuario;
    const { nome, email, cpf, senha } = req.body;

    if (!nome && !email && !cpf && !senha) {
      return res.status(400).json({ error: "Pelo menos um campo deve ser fornecido para atualização." });
    }

    try {
      let updateQuery = "UPDATE usuario SET ";
      const updateValues = [];
      const updateFields = [];

      if (nome) {
        updateFields.push("nome = ?");
        updateValues.push(nome);
      }
      if (email) {
        const [existingEmail] = await db.query(
          "SELECT idUsuario FROM usuario WHERE email = ? AND idUsuario != ?",
          [email, userId]
        );
        if (existingEmail.length > 0) {
          return res.status(409).json({ error: "Este email já está em uso por outro usuário." });
        }
        updateFields.push("email = ?");
        updateValues.push(email);
      }
      if (cpf) {
        const [existingCpf] = await db.query(
          "SELECT idUsuario FROM usuario WHERE cpf = ? AND idUsuario != ?",
          [cpf, userId]
        );
        if (existingCpf.length > 0) {
          return res.status(409).json({ error: "Este CPF já está em uso por outro usuário." });
        }
        updateFields.push("cpf = ?");
        updateValues.push(cpf);
      }
      if (senha) {
        const hashedPassword = await bcrypt.hash(senha, 10);
        updateFields.push("senha = ?");
        updateValues.push(hashedPassword);
      }

      updateQuery += updateFields.join(", ");
      updateQuery += " WHERE idUsuario = ?";
      updateValues.push(userId);

      if (updateFields.length === 0) {
        return res.status(400).json({ error: "Nenhum campo válido para atualização fornecido." });
      }

      await db.query(updateQuery, updateValues);

      const [updatedRows] = await db.query(
        "SELECT idUsuario, nome, email, cpf FROM usuario WHERE idUsuario = ?",
        [userId]
      );
      const updatedUser = updatedRows[0];

      res.status(200).json({
        message: "Perfil atualizado com sucesso!",
        user: updatedUser,
      });
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      res.status(500).json({ error: "Erro ao atualizar perfil." });
    }
  },

  forgotPassword: async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Por favor, informe seu e-mail." });
    }

    try {
      const [rows] = await db.query("SELECT * FROM usuario WHERE email = ?", [email]);
      const user = rows[0];

      if (!user) {
        // Para segurança, não informe se o email não existe.
        // Apenas diga que o link foi enviado (ou não).
        return res.status(200).json({ message: "Se o e-mail estiver cadastrado, um link para redefinição de senha foi enviado." });
      }

      // Gerar token de redefinição único
      const resetToken = crypto.randomBytes(32).toString('hex'); // Token aleatório em hexadecimal
      const resetExpires = new Date(Date.now() + 3600000); // Token válido por 1 hora (3600000 ms)

      // Salvar token e expiração no banco de dados
      await db.query(
        "UPDATE usuario SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE idUsuario = ?",
        [resetToken, resetExpires, user.idUsuario]
      );

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

      // --- PARTE DO ENVIO DE EMAIL: AGORA ENVIANDO DE VERDADE ---
      const mailOptions = {
        from: process.env.EMAIL_FROM_ADDRESS, // Endereço "De" (máscara ou seu e-mail real)
        to: user.email,                     // E-mail do destinatário
        subject: 'Redefinição de Senha para sua Lista de Compras',
        html: `
          <p>Olá,</p>
          <p>Você solicitou uma redefinição de senha para sua conta na Lista de Compras.</p>
          <p>Clique no link abaixo para redefinir sua senha. Este link é válido por 1 hora:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>Se você não solicitou esta redefinição, por favor, ignore este e-mail.</p>
          <p>Atenciosamente,</p>
          <p>Sua Equipe da Lista de Compras</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`[NODEMAILER] E-mail de redefinição enviado para ${user.email}`);
      // --- FIM DA PARTE DE EMAIL ---

      res.status(200).json({ message: "Um link para redefinição de senha foi enviado para o seu e-mail." });
    } catch (err) {
      console.error("Erro em forgotPassword (envio de email):", err);
      // Se o erro for do Nodemailer, você pode querer logar mais detalhes:
      // console.error("Detalhes do erro Nodemailer:", err.response);
      res.status(500).json({ error: "Erro interno do servidor ao solicitar redefinição. Tente novamente." });
    }
  },

  resetPassword: async (req, res) => {
    const { token } = req.params; // Token vem da URL
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "A nova senha deve ter pelo menos 6 caracteres." });
    }

    try {
      // Buscar usuário pelo token e verificar expiração
      const [rows] = await db.query(
        "SELECT * FROM usuario WHERE resetPasswordToken = ? AND resetPasswordExpires > ?",
        [token, new Date()] // Verifica se o token não expirou
      );
      const user = rows[0];

      if (!user) {
        return res.status(400).json({ error: "Token inválido ou expirado." });
      }

      // Hash da nova senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Atualizar senha e invalidar token no DB
      await db.query(
        "UPDATE usuario SET senha = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE idUsuario = ?",
        [hashedPassword, user.idUsuario]
      );

      res.status(200).json({ message: "Senha redefinida com sucesso." });
    } catch (err) {
      console.error("Erro em resetPassword:", err);
      res.status(500).json({ error: "Erro interno do servidor ao redefinir senha." });
    }
  },
};

module.exports = authController;