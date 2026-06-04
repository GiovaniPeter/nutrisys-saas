import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const defaultFromEmail = process.env.RESEND_FROM_EMAIL || 'NutriPlan <no-reply@nutriplan.app>';

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
