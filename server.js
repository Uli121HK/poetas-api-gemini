// backend/server.js
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai'; 
import dotenv from 'dotenv';

dotenv.config(); // Carga las variables de entorno desde .env

const app = express();
// ***************************************************************
// ****** CORRECCIÓN CRÍTICA: USAR process.env.PORT PARA RENDER ******
// El puerto 3000 es solo para desarrollo local.
const port = process.env.PORT || 3000; 
// ***************************************************************

// Configura CORS para permitir que tu frontend acceda a este backend
app.use(cors({
    // La lista 'origin' debe contener las URLs EXACTAS desde donde tu frontend hará solicitudes.
    // NO debe ser la URL del propio backend.
    origin: [
        'http://localhost:8000',             // Para desarrollo local del frontend (si usas puerto 8000)
        'http://localhost:8080',             // Para desarrollo local del frontend (si usas puerto 8080)
        'https://fronted-poetas.vercel.app'  // ¡TU URL DE FRONTEND EN VERCEL!
        // Añade aquí cualquier otro dominio exacto donde tu frontend pueda estar alojado
    ]
}));

// Middleware para parsear JSON en el cuerpo de las solicitudes
app.use(express.json());

// Inicializa la instancia de Google Generative AI con la API Key del entorno
// Asegúrate de que GEMINI_API_KEY esté definida en tu archivo .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define el modelo a usar (puedes probar 'gemini-pro', 'gemini-2.5-flash', etc.)
const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    config: {
      maxOutputTokens: 500,
      temperature: 0.1,
    },
});

// Ruta POST para generar la biografía
// Tu frontend está haciendo la solicitud a este endpoint: /generate-biography
app.post('/generate-biography', async (req, res) => {
    const { poetName } = req.body; // Obtiene el nombre del poeta del cuerpo de la solicitud

    if (!poetName) {
        return res.status(400).json({ error: 'Nombre del poeta es requerido.' });
    }

    try {
        const prompt = `Genera una biografía detallada de ${poetName} en español. La biografía debe tener al menos 500 palabras y cubrir los aspectos más importantes de su vida y obra. Responde solo con la biografía.`;

        // Realiza la solicitud a la API de Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const biography = response.text(); // Obtiene el texto de la respuesta de Gemini

        res.json({ biography }); // Envía la biografía generada de vuelta al frontend
    } catch (error) {
        console.error('Error al llamar a la API de Google Gemini:', error);
        // Envía un mensaje de error detallado al frontend
        res.status(500).json({ 
            error: 'Error al generar la biografía desde el servidor con Gemini.',
            details: error.message // Proporciona detalles del error para depuración
        });
    }
});

// ***************************************************************
// ****** CORRECCIÓN CRÍTICA: El servidor escucha en el puerto correcto ******
// ***************************************************************
app.listen(port, () => {
    console.log(`Servidor backend escuchando en http://localhost:${port}`);
    // En Render, este console.log mostrará el puerto dinámico asignado.
});