import Plotly from 'plotly.js-dist-min';
import { useEffect, useRef } from 'react';

interface ImageData {
  name: string;
  originalSize: number; // in bytes
  compressedSize: number; // in bytes
}

interface Props {
  images: ImageData[];
}

export default function CompressionChart({ images }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || images.length === 0) return;

    const imageNames = images.map(img => img.name);
    const originalSizes = images.map(img => img.originalSize / 1024); // KB
    const compressedSizes = images.map(img => img.compressedSize / 1024); // KB
    const compressionRatios = images.map(img =>
      Math.round((img.compressedSize / img.originalSize) * 100)
    );

    const data = [
      {
        x: imageNames,
        y: originalSizes,
        type: 'bar',
        name: 'Original Size (KB)',
        marker: { color: 'indianred' },
      },
      {
        x: imageNames,
        y: compressedSizes,
        type: 'bar',
        name: 'Compressed Size (KB)',
        marker: { color: 'lightsalmon' },
      },
    ];

    const layout = {
      title: 'Image Compression Comparison',
      barmode: 'group',
      xaxis: { title: 'Image Name' },
      yaxis: { title: 'Size (KB)' },
      annotations: imageNames.map((name, i) => ({
        x: name,
        y: compressedSizes[i],
        text: `${compressionRatios[i]}%`,
        showarrow: false,
        yshift: 10,
      })),
    };

    Plotly.newPlot(chartRef.current, data, layout);
  }, [images]);

  return <div ref={chartRef} />;
}
