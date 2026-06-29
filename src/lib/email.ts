import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const defaultFromEmail = process.env.RESEND_FROM_EMAIL || 'ClinOS <contato@clinos.tec.br>';

/**
 * Envia um e-mail transacional
 * @param to Destinatário(s)
 * @param subject Assunto do e-mail
 * @param html Corpo do e-mail em HTML
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.warn('RESEND_API_KEY não configurada. Simulando envio de e-mail:', { to, subject });
    return { success: true, simulated: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: defaultFromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error('Erro ao enviar e-mail via Resend:', error);
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Falha ao enviar e-mail:', error);
    throw new Error(error.message || 'Falha ao enviar e-mail');
  }
}

/**
 * Constrói um template HTML profissional para os e-mails
 */
export function buildEmailTemplate(title: string, contentHtml: string, actionUrl?: string, actionText?: string) {
  const buttonHtml = actionUrl && actionText 
    ? `<div style="text-align: center; margin: 30px 0;"><a href="${actionUrl}" style="background-color: #0ea5e9; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">${actionText}</a></div>`
    : '';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
      <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background-color: #0f172a; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Clin<span style="color: #0ea5e9;">OS</span></h1>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #0f172a; margin-top: 0; margin-bottom: 24px; font-size: 20px;">${title}</h2>
          <div style="color: #334155; font-size: 16px; line-height: 1.6;">
            ${contentHtml}
          </div>
          ${buttonHtml}
        </div>
        <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #64748b; font-size: 13px;">Este é um e-mail automático enviado pelo ClinOS.</p>
          <p style="margin: 4px 0 0; color: #94a3b8; font-size: 12px;">© 2026 ClinOS. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  `;
}
