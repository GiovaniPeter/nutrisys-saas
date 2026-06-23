import { S3Client } from "@aws-sdk/client-s3";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variável de ambiente não configurada: ${name}`);
  }

  return value;
}

const accountId = getRequiredEnv("R2_ACCOUNT_ID");
const accessKeyId = getRequiredEnv("R2_ACCESS_KEY_ID");
const secretAccessKey = getRequiredEnv("R2_SECRET_ACCESS_KEY");

export const R2_BUCKET_NAME = getRequiredEnv("R2_BUCKET_NAME");

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Gera uma URL pré-assinada para upload direto do navegador para o Cloudflare R2
 * @param bucket Nome do bucket (geralmente ignorado se usar R2_BUCKET_NAME)
 * @param path Caminho do arquivo (ex: 'misc/arquivo.png')
 * @param contentType Tipo MIME do arquivo
 * @returns Um objeto contendo a presignedUrl (para o PUT) e a publicUrl (para salvar no banco)
 */
export async function generatePresignedUrl(
  bucket: string,
  path: string,
  contentType: string
): Promise<{ presignedUrl: string; publicUrl: string }> {
  const targetBucket = R2_BUCKET_NAME || bucket;
  
  const command = new PutObjectCommand({
    Bucket: targetBucket,
    Key: path,
    ContentType: contentType,
  });

  try {
    // A URL pré-assinada expira em 1 hora (3600 segundos)
    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    
    // Calcula a URL pública para o frontend já saber como o arquivo se chamará
    const publicBaseUrl = process.env.R2_PUBLIC_URL;
    let publicUrl = "";
    
    if (publicBaseUrl) {
      const base = publicBaseUrl.endsWith('/') ? publicBaseUrl.slice(0, -1) : publicBaseUrl;
      publicUrl = `${base}/${path}`;
    } else {
      publicUrl = `https://${targetBucket}.${accountId}.r2.cloudflarestorage.com/${path}`;
    }

    return { presignedUrl, publicUrl };
  } catch (error: any) {
    console.error("Erro ao gerar URL pré-assinada no R2:", error);
    throw new Error(`Erro ao gerar URL pré-assinada: ${error.message}`);
  }
}