const mysql = require('mysql2');

// --- INÍCIO DAS LINHAS DE DEBUG TEMPORÁRIAS ---
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
});

connection.connect((err) => { 
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        process.exit(1); // Encerra o processo se a conexão falhar
    } else {
        console.log('Conectado ao MySQL!');
    }
});

module.exports = connection.promise(); // Exporta a conexão como uma promessa para uso assíncrono