'use client';
import React, { useState } from 'react';
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL
   } from 'firebase/storage';
import { app } from '../lib/firebaseClientConfig';
const storage = getStorage(app);

function uploadFiles(
    files: File[], setUploadProgress: (progress: number) => void
   ) {
    const promises = files.map((file) => {
     return new Promise<string>((resolve, reject) => {
      const fileRef = ref(storage, `images/${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);
   
      uploadTask.on(
       'state_changed',
       (snapshot) => {
        // Calculate the progress percentage
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
       },
       (error) => {
        reject(error);
       },
       async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
       }
      );
     });
    });
   
    return Promise.all(promises);
   }

function ImageUploadComponent() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [predictions, setPredictions] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string | null);
            };
            reader.readAsDataURL(file);
        }
    };

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!image) {
        alert('Please select an image first.');
        return;
    }

    setLoading(true);
    // Removed the async function definition and directly called the uploadFiles function
    const downloadURLs = await uploadFiles([image], (progress) => {
        console.log(`Upload is ${progress}% done`);
    });

    // uploadFiles returns an array of download URLs. If you're only uploading one file, you can just take the first element.
    const downloadURL = downloadURLs[0];

    // Send the downloadURL to the server
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imgUrl: downloadURL }),
        });
        if (!response.ok) {
            throw new Error('Failed to upload image');
        }
        const data = await response.json();
        setLoading(false);
        setPredictions(data.model_predictions);
    } catch (error) {
        setLoading(false);
        console.error('Error uploading image:', error);
        alert('Error uploading image');
    }
};
        return (
            <div className="max-w-md mx-auto my-10 p-5 border rounded-lg shadow-lg bg-white">
                <h1 className="text-xl font-bold font-mono text-center mb-6">Upload An Image For Object Detection</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="file"
                            onChange={handleImageChange}
                            accept="image/*"
                            className="block w-full text-sm text-gray-500
                                       file:mr-4 file:py-2 file:px-4
                                       file:rounded-full file:border-0
                                       file:text-sm file:font-semibold
                                       file:bg-violet-50 file:text-violet-700
                                       hover:file:bg-violet-100"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-mono py-2 px-4 rounded"
                        disabled={loading}
                    >
                        {loading ? 'Analyzing Image...' : 'Analyze Image'}
                    </button>
                </form>
                {/* display predictions */}
                {predictions && (
                    <div className="mt-1 flex flex-wrap justify-center">
                        <h2 className="text-l font-mono text-center mb-1 w-full">Analysis Results</h2>
                        {predictions.map((prediction, index) => (
                            <div key={index} className="bg-gray-100 font-mono rounded-full px-3 py-1 m-1">
                                <span className="text-violet-500">{prediction.class}</span>
                            </div>
                        ))}
                    </div>
                )}


                {imageUrl && (
                    <div className="mt-6">
                        <h2 className="text-lg font-mono text-center mb-3">Image Preview</h2>
                        <img src={imageUrl} alt="Preview" className="mx-auto" style={{ maxWidth: '100%', height: 'auto' }} />
                    </div>
                )}
            </div>
        );
}

export default ImageUploadComponent;
