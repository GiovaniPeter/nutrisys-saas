import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentPortalPatient } from "@/lib/patient-session";

export async function GET() {
  const patient = await getCurrentPortalPatient();
  
  if (!patient) {
    return NextResponse.json({ message: "Não autorizado no portal" }, { status: 401 });
  }

  try {
    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id, organizationId: patient.organizationId },
      orderBy: { startsAt: "desc" },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Erro ao buscar agenda do paciente:", error);
    return NextResponse.json({ message: "Erro ao buscar consultas." }, { status: 500 });
  }
}
