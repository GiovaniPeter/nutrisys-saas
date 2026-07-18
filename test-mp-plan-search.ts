import { MercadoPagoConfig, PreApprovalPlan } from "mercadopago";
import * as dotenv from "dotenv";
dotenv.config();

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "", options: { timeout: 5000 } });
const plan = new PreApprovalPlan(client);

async function test() {
  try {
    const result = await plan.search({
      options: {
        status: "active",
        q: "NutreClin - Plano Essencial"
      }
    });
    console.log("SUCCESS:", result.results?.length);
  } catch (err: any) {
    console.error("ERROR:", err.message);
    if (err.cause) console.error("CAUSE:", err.cause);
    if (err.response) console.error("RESPONSE:", err.response);
  }
}

test();
