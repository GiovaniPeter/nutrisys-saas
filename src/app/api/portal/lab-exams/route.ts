import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentPortalPatient } from "@/lib/patient-session";

export async function GET() {
  const patient = await getCurrentPortalPatient();
  
  if (!patient) {
    return NextResponse.json({ message: "Não autorizado no portal" }, { status: 401 });
  }

  try {
    const exams = await prisma.labExam.findMany({
      where: { patientId: patient.id, organizationId: patient.organizationId },
      include: {
        results: true,
      },
      orderBy: { examDate: "desc" },
    });

    return NextResponse.json(exams);
  } catch (error) {
    console.error("Erro ao buscar exames do paciente:", error);
    return NextResponse.json({ message: "Erro ao buscar exames." }, { status: 500 });
  }
}
