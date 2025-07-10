dotenv.config(); // <-- MOVER PARA O TOPO ABSOLUTO

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv"); // Já importado


const app = express();
// A porta será definida pelo ambiente de hospedagem (Render).
// O Render injeta a variável de ambiente PORT.
// Seu app deve escutar nesta porta.
const PORT = process.env.PORT || 3001; // 3001 é o fallback para desenvolvimento local

app.use(cors());
app.use(express.json());

// Rotas
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