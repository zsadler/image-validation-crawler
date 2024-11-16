import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { crawlerRouter } from './api/crawler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', crawlerRouter);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    const clientDist = join(__dirname, '../../dist/client');
    app.use(express.static(clientDist));

    // Handle SPA routing
    app.get('*', (req, res) => {
        res.sendFile(join(clientDist, 'index.html'));
    });
}

// Development specific routes
if (process.env.NODE_ENV !== 'production') {
    app.get('/', (req, res) => {
        res.json({ message: 'Image Crawler API is running' });
    });

    // Add a health check endpoint
    app.get('/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
}

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});