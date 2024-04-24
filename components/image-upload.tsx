'use client';
import React, { useState } from 'react';

function ImageUploadComponent() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [image, setImage] = useState<File | null>(null);

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

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!image) {
            alert('Please select an image first.');
            return;
        }
        
        const formData = new FormData();
        formData.append('image', image);

        fetch('/api/upload', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            alert('Image uploaded successfully!');
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error uploading image');
        });
    };
        return (
            <div className="max-w-md mx-auto my-10 p-5 border rounded-lg shadow-lg bg-white">
                <h1 className="text-2xl font-bold text-center mb-6">Upload an Image</h1>
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
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Upload Image
                    </button>
                </form>
                {imageUrl && (
                    <div className="mt-6">
                        <h2 className="text-lg font-semibold text-center mb-3">Image Preview</h2>
                        <img src={imageUrl} alt="Preview" className="mx-auto" style={{ maxWidth: '100%', height: 'auto' }} />
                    </div>
                )}
            </div>
        );
}

export default ImageUploadComponent;
