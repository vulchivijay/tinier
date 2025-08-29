'use client';

import Image from 'next/image';
import { useState, useCallback, useRef } from 'react';

type ImageStatus = {
  fileName: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  progress: number;
  originalSize: number;
  compressedSize?: number;
  reductionPercent?: number;
  url?: string;
};

export default function MultiImageUploaderWithProgressBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [images, setImages] = useState<ImageStatus[]>([]);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');

  const handleClick = () => {
    inputRef.current?.click();
  };

  const simulateProgress = (index: number) => {
    const interval = setInterval(() => {
      setImages(prev => {
        const updated = [...prev];
        if (updated[index].progress < 90) {
          updated[index].progress += 10;
        }
        return updated;
      });
    }, 200);

    return interval;
  };

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);

    const droppedFiles = Array.from(event.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    const initialStatus: ImageStatus[] = droppedFiles.map((file): ImageStatus => ({
      fileName: file.name,
      status: 'pending',
      progress: 0,
      originalSize: file.size,
    }));

    setImages(initialStatus);

    for (let i = 0; i < droppedFiles.length; i++) {
      const file = droppedFiles[i];
      const updatedImages = [...initialStatus];
      updatedImages[i].status = 'uploading';
      updatedImages[i].progress = 10;
      setImages([...updatedImages]);

      const progressInterval = simulateProgress(i);

      try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('format', format); // 'jpeg', 'png', or 'webp'

        const res = await fetch('/api/compress', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);

        if (!res.ok) throw new Error('Compression failed');

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        updatedImages[i].status = 'done';
        updatedImages[i].progress = 100;
        updatedImages[i].url = url;
      } catch {
        clearInterval(progressInterval);
        updatedImages[i].status = 'error';
        updatedImages[i].progress = 0;
      }

      setImages([...updatedImages]);
    }
  }, [format]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles).filter(file =>
        file.type.startsWith('image/')
      );
      handleDrop({
        preventDefault: () => { },
        dataTransfer: { files: fileArray } as unknown as DataTransfer,
      } as React.DragEvent<HTMLDivElement>);
    }
  }

  const formatSize = (bytes: number) => `${(bytes / 1024).toFixed(2)} KB`;
  const allowedFormats = ['jpeg', 'png', 'webp'] as const;

  return (
    <div className="p-8">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed p-10 text-center rounded-lg ${dragActive ? 'bg-blue-100' : 'bg-white'
          }`}
      >
        <p>Drag and drop multiple images here to compress</p>
      </div>
      <input
        type="file"
        ref={inputRef}
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <select
        value={format}
        onChange={
          (e) => {
            const value = e.target.value;
            if (allowedFormats.includes(value as typeof allowedFormats[number])) {
              setFormat(value as 'jpeg' | 'png' | 'webp');
            }
          }
        }
        className="border p-2 rounded mb-4"
      >
        <option value="jpeg">JPEG</option>
        <option value="png">PNG</option>
        <option value="webp">WebP</option>
      </select>


      {images.length > 0 && (
        <div className="mt-6 space-y-4">
          {images.map((img, index) => (
            <div key={index} className="border p-4 rounded shadow-sm">
              <p className="font-medium">{img.fileName}</p>
              <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                <div
                  className={`h-4 rounded-full ${img.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                  style={{ width: `${img.progress}%`, transition: 'width 0.3s ease' }}
                />
              </div>
              {img.status === 'done' && img.url && (
                <div className="mt-2">
                  <Image src={img.url} alt={`Compressed ${index}`} className="max-w-full h-auto rounded mb-2" />
                  <p>
                    <strong>Original:</strong> {formatSize(img.originalSize)}<br />
                    <strong>Compressed:</strong> {formatSize(img.compressedSize!)}<br />
                    <strong>Reduction:</strong> {img.reductionPercent}%<br />
                  </p>
                  <a href={img.url} download={`compressed-${index}.jpg`} className="text-blue-600 underline">
                    Download
                  </a>
                </div>
              )}
              {img.status === 'error' && <p className="text-red-600 mt-2">Compression failed</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
