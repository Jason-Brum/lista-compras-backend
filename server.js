const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const itemRoutes = require("./routes/itemRoutes");
const usuarioRoutes = require('./routes/usuarioRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const listaRoutes = require('./routes/listaRoutes');
const authRoutes = require('./routes/authRoutes');



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rotas
app.use("/items", itemRoutes);
app.use('/usuarios', usuarioRoutes);
app.use("/categorias", categoriaRoutes);
app.use("/listas", listaRoutes);
app.use('/auth', authRoutes);




app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});



