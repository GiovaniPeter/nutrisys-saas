import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

type Params = { params: { logId: string } };

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) return error("Nao autenticado.", 401);

  const existing = await prisma.hydrationLog.findFirst({
    where: { id: params.logId, organizationId: user.organizationId },
    select: { id: true }
  });

  if (!existing) return error("Registro de hidratacao nao encontrado.", 404);

  await prisma.hydrationLog.delete({ where: { id: params.logId } });

  await audit({
    organizationId: user.organizationId,
    userId: user.id,
    action: "hydration.deleted",
    entity: "HydrationLog",
    entityId: params.logId
  });

  return json({ ok: true });
}
