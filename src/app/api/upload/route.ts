import { NextResponse } from 'next/server';
import { generatePresignedUrl } from '@/lib/r2';
import { getCurrentUser } from '@/lib/session';
import { getCurrentPortalPatient } from '@/lib/patient-session';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const patient = user ? null : await getCurrentPortalPatient();

    if (!user && !patient) {
      return NextResponse.json({ error: 'Nao autenticado.' }, { status: 401 });
    }

    // Recebemos um JSON com os dados do arquivo para gerar a URL
    const body = await request.json();
    const { fileName, fileType, bucket, folder } = body;

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'fileName e fileType são obrigatórios' }, { status: 400 });
    }

    const targetBucket = bucket || 'nutriplan-uploads';
    const targetFolder = folder || 'misc';

    const timestamp = Date.now();
    const extension = fileName.split('.').pop() || '';
    const ownerId = user?.id || patient?.id || 'upload';
    const safeName = `${ownerId}-${timestamp}.${extension}`;
    const path = `${targetFolder}/${safeName}`;

    // Gera a URL pré-assinada
    const { presignedUrl, publicUrl } = await generatePresignedUrl(
      targetBucket,
      path,
      fileType
    );

    return NextResponse.json({ 
      success: true, 
      presignedUrl,
      publicUrl,
      path: path
    });

  } catch (error: any) {
    console.error('Erro ao gerar URL de upload:', error);
    return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 });
  }
}
