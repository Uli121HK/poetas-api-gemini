    // backend/server.js
    import express from 'express';
    import cors from 'cors';
    import { GoogleGenerativeAI } from '@google/generative-ai'; 
    import dotenv from 'dotenv';

    dotenv.config();

    const app = express();
    const port = process.env.PORT || 3000;

    app.use(cors({
        origin: [
            'http://localhost:8000',
            'http://localhost:8080',
            'https://fronted-poetas.vercel.app'
        ]
    }));
    // ************************************************************
    // ****** AÑADE ESTA LÍNEA DE LOG DE DEPURACIÓN ******
    // ************************************************************
    console.log(`CORS configurado para los orígenes: ${process.env.NODE_ENV === 'production' ? 'Producción' : JSON.stringify(['http://localhost:8000', 'http://localhost:8080', 'https://fronted-poetas.vercel.app'])}`);
    // ************************************************************

    app.use(express.json());

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        config: {
          maxOutputTokens: 500,
          temperature: 0.1,
        },
    });

    app.post('/generate-biography', async (req, res) => {
        const { poetName } = req.body;

        if (!poetName) {
            return res.status(400).json({ error: 'Nombre del poeta es requerido.' });
        }

        try {
            const prompt = `Genera una biografía detallada de ${poetName} en español. La biografía debe tener al menos 500 palabras y cubrir los aspectos más importantes de su vida y obra. Responde solo con la biografía.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const biography = response.text();

            res.json({ biography });
        } catch (error) {
            console.error('Error al llamar a la API de Google Gemini:', error);
            res.status(500).json({ 
                error: 'Error al generar la biografía desde el servidor con Gemini.',
                details: error.message
            });
        }
    });

    app.listen(port, () => {
        console.log(`Servidor backend escuchando en http://localhost:${port}`);
    });