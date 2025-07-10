const mysql = require('mysql2');

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