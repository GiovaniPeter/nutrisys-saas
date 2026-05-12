import { json } from "@/lib/api";
import { PLANS } from "@/lib/plans";

export async function GET() {
  return json({ plans: PLANS });
}
