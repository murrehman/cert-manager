import express from 'express';
import cors from 'cors';
import { checkSSL } from './services/sslChecker';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/check-ssl', async (req, res) => {
    const { url, detailed } = req.query;

    if (!url || typeof url !== 'string') {
        res.status(400).json({ error: 'Missing or invalid URL parameter' });
        return;
    }

    try {
        const isDetailed = detailed === 'true';
        const result = await checkSSL(url, isDetailed);
        res.json(result);
    } catch (error: any) {
        console.error('SSL check error:', error);
        res.status(500).json({ error: error.message || 'Failed to check SSL' });
    }
});

app.listen(port, () => {
    console.log(`Backend server running at port ${port}`);
});
