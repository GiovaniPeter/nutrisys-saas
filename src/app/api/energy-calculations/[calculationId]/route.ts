import { NextRequest } from "next/server";
import { audit } from "@/lib/audit";
import { error, json } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function DELETE(_request: NextRequest, { params }: { params: { calculationId: string } }) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const calculation = await prisma.energyCalculation.findFirst({
    where: {
      id: params.calculationId,
      organizationId: user.organizationId
    },
    select: { id: true }
  });

  if (!calculation) {
    return error("Calculo nao encontrado.", 404);
  }

  await prisma.energyCalculation.delete({
    where: { id: params.calculationId }
  });

  await audit({
    organizationId: user.organizationId,
    userId: user.id,
    action: "energy_calculation.deleted",
    entity: "EnergyCalculation",
    entityId: params.calculationId
  });

  return json({ ok: true });
}
