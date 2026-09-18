'use client';
import { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function UploadScreenshot() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Login required');

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary env variables missing');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', `ff_arena/${user.uid}`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      await addDoc(collection(db, 'matches'), {
        userId: user.uid,
        userEmail: user.email,
        screenshotURL: data.secure_url,
        publicId: data.public_id,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      alert('Screenshot upload ho gaya!');
      setFile(null);
      setPreview(null);
    } catch (error) {
      console.error(error);
      alert('Error: ' + error.message);
    }
    setUploading(false);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Screenshot Upload</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4 w-full"
      />

      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="mb-4 w-full rounded-lg border"
        />
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="bg-blue-500 text-white px-4 py-2 rounded w-full disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload Screenshot'}
      </button>
    </div>
  );
}
