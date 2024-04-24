// path: /api/upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { processImage } from '../../utils/imageProcessor';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { imgUrl } = req.body;

        // const imgUrl = 'https://t4.ftcdn.net/jpg/00/65/70/65/360_F_65706597_uNm2SwlPIuNUDuMwo6stBd81e25Y8K8s.jpg'; this works okay
        // const imgUrl = 'https://firebasestorage.googleapis.com/v0/b/real-one-ee089.appspot.com/o/images%2Fdua.jpg?alt=media&token=3e956f3e-0664-4d1f-ba8e-e42a4d6b3dbf';
        if (!imgUrl) {
            return res.status(400).json({ error: 'Image URL is required' });
        }

        try {
            // Download the image from the provided URL
            const response = await axios.get(imgUrl as string, { responseType: 'stream' });
            if (response.status !== 200) {
                return res.status(400).json({ error: 'Failed to download image' });
            }

            // Process the image and detect objects
            // const model = await cocoSsd.load();
            const predictions = await processImage(response.data);

            // Respond back with detected objects
            res.status(200).json({ message: 'Image processed successfully', predictions });
        } catch (error) {
            console.error('Error processing image:', error);
            res.status(500).json({ error: 'Error processing the image' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}