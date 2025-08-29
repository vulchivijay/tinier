'use client';

import { useState } from 'react';

export default function ImageUploader() {
  const [compressedImage, setCompressedImage] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/compress', {
      method: 'POST',
      body: formData,
    });

    const blob = await res.blob();
    setCompressedImage(URL.createObjectURL(blob));

    // const blob = xhr.response;
    // const url = URL.createObjectURL(blob);

  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleUpload} />
      {compressedImage && <img src={compressedImage} alt="Compressed" />}
      {/* <img src={url} alt="Compressed" />
      <a href={url} download="compressed.jpg">Download</a> */}

    </div>
  );
}
