import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { generatePresignedUrl, generateSignedReadUrl } from "@/lib/r2";
import { getCurrentUser } from "@/lib/session";
import { getCurrentPortalPatient } from "@/lib/patient-session";

const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf"
};

const ALLOWED_FOLDERS = new Set(["food-diary", "lab-exams", "materials", "logos", "misc"]);
const CLINICAL_PRIVATE_FOLDERS = new Set(["food-diary", "lab-exams"]);
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const patient = user ? null : await getCurrentPortalPatient();

    if (!user && !patient) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = await request.json();
    const { fileName, fileType, bucket, folder, fileSize } = body || {};

    if (!fileName || !fileType) {
      return NextResponse.json({ error: "fileName e fileType são obrigatórios." }, { status: 400 });
    }

    const safeExt = ALLOWED_MIME_TO_EXT[String(fileType).toLowerCase()];
    if (!safeExt) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Envie apenas JPG, PNG, WEBP ou PDF." },
        { status: 400 }
      );
    }

    if (fileSize !== undefined && Number(fileSize) > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Arquivo excede o limite máximo de 10 MB." }, { status: 400 });
    }

    const requestedFolder = String(folder || "misc").trim().toLowerCase();
    const safeFolder = ALLOWED_FOLDERS.has(requestedFolder) ? requestedFolder : "misc";

    if (patient && safeFolder !== "food-diary") {
      return NextResponse.json({ error: "Pasta de upload não autorizada para o portal do paciente." }, { status: 403 });
    }

    const organizationId = user?.organizationId || patient!.organizationId;
    const targetBucket = bucket || "nutriplan-uploads";
    const uniqueKey = crypto.randomUUID();
    const objectPath = `org/${organizationId}/${safeFolder}/${uniqueKey}.${safeExt}`;

    const { presignedUrl, publicUrl } = await generatePresignedUrl(targetBucket, objectPath, String(fileType));
    const isPrivateClinical = CLINICAL_PRIVATE_FOLDERS.has(safeFolder);
    const readUrl = isPrivateClinical
      ? `/api/upload?path=${encodeURIComponent(objectPath)}`
      : publicUrl;

    await audit({
      organizationId,
      userId: user?.id,
      action: "file.upload_url_generated",
      entity: "Upload",
      entityId: uniqueKey,
      metadata: {
        folder: safeFolder,
        mimeType: String(fileType),
        privateClinical: isPrivateClinical,
        patientId: patient?.id || null
      }
    });

    return NextResponse.json({
      success: true,
      presignedUrl,
      publicUrl: readUrl,
      path: objectPath,
      privateClinical: isPrivateClinical
    });
  } catch (error: any) {
    console.error("Erro ao gerar URL de upload:", error);
    return NextResponse.json({ error: error.message || "Erro interno no servidor." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const patient = user ? null : await getCurrentPortalPatient();

    if (!user && !patient) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const objectPath = request.nextUrl.searchParams.get("path")?.trim() || "";
    const organizationId = user?.organizationId || patient!.organizationId;

    if (!objectPath || objectPath.includes("..") || !objectPath.startsWith(`org/${organizationId}/`)) {
      return NextResponse.json({ error: "Acesso negado ao arquivo solicitado." }, { status: 403 });
    }

    if (user?.role === "SECRETARY" && (objectPath.includes("/lab-exams/") || objectPath.includes("/food-diary/"))) {
      return NextResponse.json({ error: "Perfil de secretária não pode acessar anexos clínicos." }, { status: 403 });
    }

    const signedReadUrl = await generateSignedReadUrl("nutriplan-uploads", objectPath, 900);
    return NextResponse.redirect(signedReadUrl, 302);
  } catch (error: any) {
    console.error("Erro ao gerar leitura assinada no R2:", error);
    return NextResponse.json({ error: "Não foi possível abrir o arquivo." }, { status: 500 });
  }
}
