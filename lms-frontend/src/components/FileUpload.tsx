// src/components/FileUpload.tsx
import { useState } from 'react';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onUploadComplete: (file: { name: string; url: string; type: string }) => void;
  label?: string;
}

export default function FileUpload({ onUploadComplete, label = "Upload File" }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);

  // Access environment variables
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_PRESET;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Check if ENV variables are loaded
    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary configuration missing in .env file");
      console.error("Missing VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_PRESET");
      return;
    }

    setUploading(true);
    const loadingToast = toast.loading("Uploading file...");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset); // Uses the preset from .env

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.secure_url) {
        toast.success("Upload Complete!", { id: loadingToast });
        
        // Send the data back to the parent component (CourseDetail)
        onUploadComplete({
          name: file.name,
          url: data.secure_url,
          type: file.type.includes('video') ? 'VIDEO' : 'PDF/IMAGE'
        });
      } else {
        console.error("Cloudinary Error:", data);
        toast.error("Upload failed. See console.", { id: loadingToast });
      }
    } catch (error) {
      console.error("Network Error:", error);
      toast.error("Upload Error.", { id: loadingToast });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-bold mb-1 text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        <input 
          type="file" 
          disabled={uploading}
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            cursor-pointer"
        />
        {uploading && <span className="text-blue-600 font-bold text-sm animate-pulse">⏳ Processing...</span>}
      </div>
    </div>
  );
}