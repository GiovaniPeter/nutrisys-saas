import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentPortalPatient } from "@/lib/patient-session";

export async function GET() {
  const patient = await getCurrentPortalPatient();
  
  if (!patient) {
    return NextResponse.json({ message: "Não autorizado no portal" }, { status: 401 });
  }

  try {
    const mealPlans = await prisma.mealPlan.findMany({
      where: { patientId: patient.id, organizationId: patient.organizationId },
      include: {
        meals: {
          orderBy: { position: "asc" },
          include: {
            items: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(mealPlans);
  } catch (error) {
    console.error("Erro ao buscar planos alimentares do paciente:", error);
    return NextResponse.json({ message: "Erro ao buscar planos alimentares." }, { status: 500 });
  }
}
