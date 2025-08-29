// app/api/compress/route.ts

import sharp from 'sharp';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('image') as File;
  const format = (formData.get('format') as string)?.toLowerCase() || 'jpeg';

  if (!file) {
    return new Response(JSON.stringify({ error: 'No image uploaded' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    let compressedBuffer: Buffer;

    if (format === 'png') {
      compressedBuffer = await sharp(buffer)
        .png({ compressionLevel: 9 })
        .toBuffer();
    } else if (format === 'webp') {
      compressedBuffer = await sharp(buffer)
        .webp({ quality: 70 })
        .toBuffer();
    } else {
      compressedBuffer = await sharp(buffer)
        .jpeg({ quality: 70 })
        .toBuffer();
    }

    return new Response(compressedBuffer, {
      status: 200,
      headers: {
        'Content-Type': `image/${format}`,
        'Content-Disposition': 'inline',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Compression failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
