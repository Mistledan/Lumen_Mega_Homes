import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server-auth';
import { saveUploadedFile } from '@/lib/upload';

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ message: 'Invalid upload payload.' }, { status: 400 });
  }

  const file = formData.get('file');
  const folder = String(formData.get('folder') || 'general');

  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'No file was uploaded.' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ message: 'Only image files can be uploaded.' }, { status: 400 });
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json({ message: 'Image must be smaller than 8MB.' }, { status: 400 });
  }

  try {
    const url = await saveUploadedFile(file, folder);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Image upload failed', error);
    return NextResponse.json({ message: 'Image upload failed.' }, { status: 500 });
  }
}
