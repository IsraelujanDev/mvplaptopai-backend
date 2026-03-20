import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import laptopRoutes from './routes/laptops';

dotenv.config();

const app = express();
app.use(express.json()); // Middleware para poder leer JSON en el body

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI as string;

//conectar a MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

//Rutas
app.get('/', (req, res) => {
    res.send('MVPLaptopAI API Running');
});
app.use('/laptops', laptopRoutes); // Rutas para laptops

//Iniciar servidor
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

