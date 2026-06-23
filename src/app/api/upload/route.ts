import { NextResponse } from 'next/server';
import { uploadFileToR2 } from '@/lib/r2';
import { getCurrentUser } from '@/lib/session';
import { getCurrentPortalPatient } from '@/lib/patient-session';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const patient = user ? null : await getCurrentPortalPatient();

    if (!user && !patient) {
      return NextResponse.json({ error: 'Nao autenticado.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string || 'nutriplan-uploads';
    const folder = formData.get('folder') as string || 'misc';

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const ownerId = user?.id || patient?.id || 'upload';
    const safeName = `${ownerId}-${timestamp}.${extension}`;
    const path = `${folder}/${safeName}`;

    const publicUrl = await uploadFileToR2(
      bucket,
      path,
      buffer,
      file.type || 'application/octet-stream'
    );

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      path: path
    });

  } catch (error: any) {
    console.error('Erro no upload de arquivo:', error);
    return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 });
  }
}
