import { MercadoPagoConfig, PreApprovalPlan } from "mercadopago";
import * as dotenv from "dotenv";
dotenv.config();

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "", options: { timeout: 5000 } });
const plan = new PreApprovalPlan(client);

async function test() {
  try {
    const result = await plan.create({
      body: {
        reason: "NutreClin - Plano Essencial",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: 39.50,
          currency_id: "BRL",
          free_trial: {
            frequency: 7,
            frequency_type: "days"
          }
        },
        back_url: "https://clinos.tec.br/billing?checkout=mercadopago"
      }
    });
    console.log("SUCCESS:", result.id);
  } catch (err: any) {
    console.error("ERROR:", err.message);
    if (err.cause) console.error("CAUSE:", err.cause);
    if (err.response) console.error("RESPONSE:", err.response);
  }
}

test();
