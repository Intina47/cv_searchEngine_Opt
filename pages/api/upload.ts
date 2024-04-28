// path: /api/upload
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { processImage } from '../../utils/imageProcessor';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { imgUrl } = req.body; // Extract imgUrl from the request body
        if (!imgUrl) {
            return res.status(400).json({ error: 'Image URL is required' });
        }
        console.log('Received image:', imgUrl);
        try {
            // Download the image from the provided URL
            const response = await axios.get(imgUrl, { responseType: 'stream' });
            if (response.status !== 200) {
                return res.status(400).json({ error: 'Failed to download image' });
            }
            
            const model_predictions = await processImage(response.data);

            // Respond back with detected objects
            res.status(200).json({ message: 'Image processed successfully', model_predictions });
        } catch (error) {
            console.error('Error processing image:', error);
            res.status(500).json({ error: 'Error processing the image' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
