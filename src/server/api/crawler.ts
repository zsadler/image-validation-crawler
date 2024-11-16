import { Router } from 'express';
import { ImageCrawler } from '../services/imageCrawler.js';
import type { CrawlRequest } from '../types';

const router = Router();

router.post('/crawl', async (req, res) => {
    try {
        const request: CrawlRequest = req.body;
        if (!request.url || !request.type) {
            return res.status(400).json({ error: 'URL and type are required' });
        }

        const result = await ImageCrawler.crawlPage(request);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Add a test endpoint
router.get('/test', (req, res) => {
    res.json({ message: 'Crawler API is working' });
});

export const crawlerRouter = router;