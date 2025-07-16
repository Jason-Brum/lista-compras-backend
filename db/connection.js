const mysql = require('mysql2');

// --- LINHAS DE DEBUG TEMPORÁRIAS (MANTENHA POR ENQUANTO) ---
console.log('--- DEBUG DE CONEXÃO COM O BANCO DE DADOS ---');
console.log('DB_HOST sendo usado:', process.env.DB_HOST);
console.log('DB_USER sendo usado:', process.env.DB_USER);
console.log('DB_NAME sendo usado:', process.env.DB_NAME);
console.log('DB_PORT sendo usado:', process.env.DB_PORT);
console.log('-------------------------------------------');
// --- FIM DAS LINHAS DE DEBUG TEMPORÁRIAS ---

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // --- ADICIONE ESTAS LINHAS PARA SSL/TLS ---
    ssl: {
        // Isso desabilita a verificação do certificado. Usar com cautela em produção,
        // mas é comum para provedores que não fornecem CA certificates publicamente.
        // Se a Hostinger exigir um certificado específico, 'rejectUnauthorized: false' pode não ser suficiente.
        rejectUnauthorized: false
    }
    // ------------------------------------------
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        process.exit(1);
    } else {
        console.log('Conectado ao MySQL!');
    }
});

module.exports = connection.promise();