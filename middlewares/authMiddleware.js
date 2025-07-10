const jwt = require('jsonwebtoken');
const db = require('../db/connection'); // Importe sua conexão

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido ou formato inválido.' });
    }

    const token = authHeader.split(' ')[1]; // Pega o token após "Bearer "

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Busca o usuário no banco de dados para garantir que ele ainda existe
        const [rows] = await db.query('SELECT idUsuario, nome, email, cpf FROM usuario WHERE idUsuario = ?', [decoded.idUsuario]);
        const user = rows[0];

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        req.user = user; // Anexa as informações do usuário à requisição
        next(); // Continua para a próxima função na rota

    } catch (err) {
        console.error('Erro na validação do token:', err);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado. Por favor, faça login novamente.' });
        }
        return res.status(401).json({ error: 'Token inválido.' });
    }
};

module.exports = authMiddleware;