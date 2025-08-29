// import ImageUploader from '@/app/components/ImageUploader';
import MultiImageUploaderWithProgressBar from '@/app/components/ImageDropzone';
// import CompressionChart from '@/app/components/CompressionChart';

export default function Home() {
  return (
    <div>
      <h1>TinyPNG Clone</h1>
      {/* <ImageUploader /> */}

      <MultiImageUploaderWithProgressBar />

      {/* <CompressionChart
        images={images.map(img => ({
          name: img.id,
          originalSize: img.originalSize,
          compressedSize: img.compressedSize ?? 0,
        }))}
      /> */}
    </div>
  );
}
