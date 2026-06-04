import { MercadoPagoConfig, Preference } from 'mercadopago';

// Instância do SDK do Mercado Pago
// Recomenda-se adicionar a ACCESS_TOKEN no seu .env
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || '';

export const mpClient = new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } });

export const mpPreference = new Preference(mpClient);
