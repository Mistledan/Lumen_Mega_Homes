import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export function sanitizeFileName(input: string, fallback = 'upload') {
  const base = path.basename(String(input || fallback).replace(/\\/g, '/')) || fallback;
  const extension = path.extname(base).toLowerCase();
  const stem = path.basename(base, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || fallback;

  return `${stem}${extension}`;
}

export async function saveUploadedFile(file: File, folder = 'general') {
  if (!file || typeof file.arrayBuffer !== 'function') {
    throw new Error('A valid image file is required.');
  }

  const safeFolder = String(folder || 'general')
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-zA-Z0-9/_-]+/g, '-')
    .replace(/\/+/, '/') || 'general';

  const targetDir = path.join(process.cwd(), 'public', 'uploads', safeFolder);
  await mkdir(targetDir, { recursive: true });

  const filename = sanitizeFileName(file.name || 'upload.jpg');
  const savedName = `${Date.now()}-${randomUUID()}-${filename}`;
  const savedPath = path.join(targetDir, savedName);

  const bytes = await file.arrayBuffer();
  await writeFile(savedPath, Buffer.from(bytes));

  return `/uploads/${safeFolder}/${savedName}`;
}
