const mysql = require('mysql2/promise');

// --- LINHAS DE DEBUG (PODE MANTER POR ENQUANTO) ---
console.log('--- DEBUG DE CONEXÃO COM O BANCO DE DADOS ---');
console.log('DB_HOST sendo usado:', process.env.DB_HOST);
console.log('DB_USER sendo usado:', process.env.DB_USER);
console.log('DB_NAME sendo usado:', process.env.DB_NAME);
console.log('DB_PORT sendo usado:', process.env.DB_PORT);
console.log('-------------------------------------------');

// CORREÇÃO: Trocamos createConnection por createPool e adicionamos opções de resiliência
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,  // Espera por uma conexão disponível se todas estiverem em uso
    connectionLimit: 10,       // Número máximo de conexões no pool
    queueLimit: 0              // Fila de espera por conexões sem limite
});

console.log('Pool de conexões com o MySQL criado e pronto para uso!');

// Exportamos o pool. A interface .promise() garante que você pode continuar
// usando await db.query(...) no resto do seu código sem nenhuma alteração.
module.exports = pool;