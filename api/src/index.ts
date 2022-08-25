import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fetchEstimatedMergeInfo } from './etherscan';

const port = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
    // Results stay cached for 20 seconds
    res.set('Cache-Control', 'public, max-age=20');
    next();
});

app.get('/', async (req, res) => {
    try {
        const info = await fetchEstimatedMergeInfo();
        const date = new Date(info.estimatedMergeDate * 1000);

        res.status(200).send({
            ...info,
            localeDate: `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`,
        });
    } catch (err) {
        console.error(`Error occurred: ${err}`);
        res.status(500).send({
            message: 'An unexpected error occurred',
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
