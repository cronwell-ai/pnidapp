'use client'

import { pdfjs } from 'react-pdf';
import { createHash } from 'crypto';
import { addFileToProject } from '@/actions/db/projects';
import { createClient } from '@/lib/supabase/client';

function calculateSHA256(arrayBuffer: ArrayBuffer): Promise<string> {
  const buffer = Buffer.from(arrayBuffer);
  const hash = createHash("sha256");
  hash.update(buffer);
  return Promise.resolve(hash.digest("hex"));
}

function str2ab(str: string): ArrayBuffer {
  var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

async function getFileDimensions(file: File): Promise<{ width: number; height: number }> {
  if (file.type.startsWith('image/')) {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    const size = await new Promise<{ width: number; height: number }>((resolve) => {
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        URL.revokeObjectURL(img.src);
        resolve({ width, height });
      };
    });
    return size;
  } else if (file.type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDocument = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const page = await pdfDocument.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    return { width: viewport.width, height: viewport.height };
  }
  return { width: -1, height: -1 }
}


async function createImageThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.999));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function createPDFThumbnail(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const scale = 1.5;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({
    canvasContext: context!,
    viewport: viewport
  }).promise;

  return canvas.toDataURL('image/jpeg', 0.7);
}

async function getFilePath(file: File): Promise<string> {
  const timestamp = await calculateSHA256(str2ab(Date.now().toString()));
  const fileName = await calculateSHA256(str2ab(file.name));
  const shortTimestamp = timestamp.substring(0, 8);
  const shortFileName = fileName.substring(0, 8);
  const filePath = `${shortTimestamp}-${shortFileName}`;
  return filePath;
}

async function getThumbnail(file: File): Promise<Blob> {
  const thumbnail = file.type.startsWith('image/') ? await createImageThumbnail(file) : await createPDFThumbnail(file)
  const fetchThumbnail = await fetch(thumbnail)
  const thumbnailBlob = await fetchThumbnail.blob()
  return thumbnailBlob
}

export default async function uploadFile(file: File, projectId: string, ispnid: boolean) {
  const supabase = createClient()
  const { width, height } = await getFileDimensions(file)
  const filePath = await getFilePath(file)
  const thumbnail = await getThumbnail(file)

  // Upload original file
  const { error: uploadError } = await supabase.storage.from('files').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false
  })
  if (uploadError) {
    throw uploadError
  }

  const { data:thumbnailUploadData, error: thumbnailUploadError } = await supabase.storage.from('thumbnails').upload(filePath, thumbnail, {
    contentType: 'image/jpeg',
    cacheControl: '3600',
    upsert: false
  })
  if (thumbnailUploadError) {
    throw thumbnailUploadError
  }

  const thumbnailUrl = thumbnailUploadData.path

  const { error } = await addFileToProject(projectId, file.name, filePath, ispnid, width, height, file.type, thumbnailUrl)
  if (error) {
    throw error
  }
}