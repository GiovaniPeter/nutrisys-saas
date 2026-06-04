import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentPortalPatient } from "@/lib/patient-session";

export async function GET() {
  const patient = await getCurrentPortalPatient();
  
  if (!patient) {
    return NextResponse.json({ message: "Não autorizado no portal" }, { status: 401 });
  }

  try {
    const prescriptions = await prisma.supplementPrescription.findMany({
      where: { patientId: patient.id, organizationId: patient.organizationId },
      include: {
        items: true,
      },
      orderBy: { prescribedAt: "desc" },
    });

    return NextResponse.json(prescriptions);
  } catch (error) {
    console.error("Erro ao buscar prescrições do paciente:", error);
    return NextResponse.json({ message: "Erro ao buscar suplementações." }, { status: 500 });
  }
}
