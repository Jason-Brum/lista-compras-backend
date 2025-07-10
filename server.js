// A MAIORIA DOS TUTORIAIS RECOMENDA ESTA LINHA COMO A PRIMEIRA DO ARQUIVO PARA GARANTIR O LOAD DO .ENV
require("dotenv").config(); // <-- ESTA LINHA PRECISA SER A PRIMEIRA EXECUTÁVEL

const express = require("express");
const cors = require("cors");
// const dotenv = require("dotenv"); // <-- ESTA LINHA NÃO É MAIS NECESSÁRIA SE A PRIMEIRA ESTÁ LÁ

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rotas (agora elas serão importadas DEPOIS que dotenv.config() for executado)
const itemRoutes = require("./routes/itemRoutes");
const usuarioRoutes = require('./routes/usuarioRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const listaRoutes = require('./routes/listaRoutes');
const authRoutes = require('./routes/authRoutes');

app.use("/items", itemRoutes);
app.use('/usuarios', usuarioRoutes);
app.use("/categorias", categoriaRoutes);
app.use("/listas", listaRoutes);
app.use('/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});