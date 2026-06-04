import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { mpPreference } from '@/lib/mercadopago';

export async function POST(request: Request) {
  try {
    const session = await requireAuth(request);

    // Na versão real, pegaremos o plano escolhido no body
    const { planId, title, price } = await request.json();

    if (!title || !price) {
      return NextResponse.json({ error: 'Faltam parâmetros do plano' }, { status: 400 });
    }

    // Criar preferência de pagamento no Mercado Pago
    const preference = await mpPreference.create({
      body: {
        items: [
          {
            id: planId || 'plano_padrao',
            title: title,
            quantity: 1,
            unit_price: Number(price),
            currency_id: 'BRL',
          }
        ],
        back_urls: {
          success: `${process.env.APP_URL}/dashboard?payment=success`,
          failure: `${process.env.APP_URL}/dashboard?payment=failure`,
          pending: `${process.env.APP_URL}/dashboard?payment=pending`
        },
        auto_return: 'approved',
        external_reference: session.organizationId // Vinculando à organização do profissional
      }
    });

    return NextResponse.json({ 
      success: true, 
      checkoutUrl: preference.init_point 
    });

  } catch (error: any) {
    console.error('Erro ao gerar checkout do Mercado Pago:', error);
    return NextResponse.json({ error: error.message || 'Erro ao gerar checkout' }, { status: 500 });
  }
}
