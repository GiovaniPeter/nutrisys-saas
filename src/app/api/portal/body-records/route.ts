import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentPortalPatient } from "@/lib/patient-session";

export async function GET() {
  const patient = await getCurrentPortalPatient();
  
  if (!patient) {
    return NextResponse.json({ message: "Não autorizado no portal" }, { status: 401 });
  }

  try {
    const records = await prisma.bodyRecord.findMany({
      where: { patientId: patient.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Erro ao buscar evolução corporal do paciente:", error);
    return NextResponse.json({ message: "Erro ao buscar evolução corporal." }, { status: 500 });
  }
}
