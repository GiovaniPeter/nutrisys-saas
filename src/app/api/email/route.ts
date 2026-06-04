import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { requireAuth } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const session = await requireAuth(request);

    // Na versão final, verificaremos se o user tem permissão (role)
    const { to, subject, html } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Parâmetros "to", "subject" e "html" são obrigatórios' }, { status: 400 });
    }

    const result = await sendEmail({ to, subject, html });

    return NextResponse.json({ success: true, result });

  } catch (error: any) {
    console.error('Erro na rota de e-mail:', error);
    return NextResponse.json({ error: error.message || 'Erro ao enviar e-mail' }, { status: 500 });
  }
}
