import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentPortalPatient } from "@/lib/patient-session";

export async function GET() {
  const patient = await getCurrentPortalPatient();
  
  if (!patient) {
    return NextResponse.json({ message: "Não autorizado no portal" }, { status: 401 });
  }

  try {
    const materials = await prisma.educationalMaterial.findMany({
      where: { 
        organizationId: patient.organizationId,
        audience: { in: ["ALL", "PATIENTS"] }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error("Erro ao buscar materiais:", error);
    return NextResponse.json({ message: "Erro ao buscar materiais educativos." }, { status: 500 });
  }
}
