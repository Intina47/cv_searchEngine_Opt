import * as tf from '@tensorflow/tfjs-node';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { Readable } from 'stream';
import sharp from 'sharp';

/**
 * Processes an image by reading it from a stream, loading a model, and making predictions.
 * @param imageStream - The readable stream containing the image data.
 * @returns A promise that resolves to an array of predictions made by the model.
 */
export async function processImage(imageStream: Readable) {
    console.log('Processing image...');
    const chunks: Buffer[] = [];
    for await (const chunk of imageStream) {
        console.log('Received chunk:', chunk.length);
        chunks.push(chunk);
    }
    console.log('Received all chunks');
    const imageBuffer = Buffer.concat(chunks);
    const pngBuffer = await sharp(imageBuffer).png().toBuffer();

    console.log('Loading model...');
    const model = await cocoSsd.load();

    // Decode the image into a tensor because Coco SSD expects a tensor as input
    const tensor = tf.node.decodeImage(pngBuffer).toFloat().expandDims(0) as tf.Tensor4D;

    // Resize the image to 300x300
    const resizedTensor = tf.image.resizeBilinear(tensor, [300, 300]);

    // Expand the dimensions to match the model's expected input shape
    const expandedTensor = resizedTensor.asType('int32');

    // Squeeze the dimensions to match the model's input shape
    const reshapedTensor = expandedTensor.squeeze([0]) as tf.Tensor3D;

    // Make predictions
    const predictions = await model.detect(reshapedTensor);

    // Clean up tensor
    tensor.dispose();
    resizedTensor.dispose();
    expandedTensor.dispose();

    return predictions;
}