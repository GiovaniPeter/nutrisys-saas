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

/**
 * Função utilitária para fazer upload de arquivos no Cloudflare R2
 * @param bucket Nome do bucket (geralmente ignorado se usar R2_BUCKET_NAME)
 * @param path Caminho do arquivo (ex: 'misc/arquivo.png')
 * @param fileBuffer Buffer do arquivo
 * @param contentType Tipo MIME do arquivo
 * @returns A URL pública (se configurada) ou a URL de acesso
 */
export async function uploadFileToR2(
  bucket: string,
  path: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> {
  const targetBucket = R2_BUCKET_NAME || bucket;
  
  const command = new PutObjectCommand({
    Bucket: targetBucket,
    Key: path,
    Body: fileBuffer,
    ContentType: contentType,
  });

  try {
    await r2Client.send(command);
    
    // O R2 permite configurar uma URL pública (ex: https://pub-xxxx.r2.dev)
    // Se você tiver uma configurada no Cloudflare, coloque no .env como R2_PUBLIC_URL
    const publicBaseUrl = process.env.R2_PUBLIC_URL;
    
    if (publicBaseUrl) {
      // Remove barra final se existir e concatena
      const base = publicBaseUrl.endsWith('/') ? publicBaseUrl.slice(0, -1) : publicBaseUrl;
      return `${base}/${path}`;
    }

    // Se não tiver R2_PUBLIC_URL, retorna um aviso de que não está acessível publicamente,
    // ou uma URL provisória. O ideal é o cliente configurar R2_PUBLIC_URL.
    return `https://${targetBucket}.${accountId}.r2.cloudflarestorage.com/${path}`;
  } catch (error: any) {
    console.error("Erro no upload para o R2:", error);
    throw new Error(`Erro no upload para o R2: ${error.message}`);
  }
}