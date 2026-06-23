import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Instância global para cache em tempo de execução
let r2ClientInstance: S3Client | null = null;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente não configurada: ${name}. Configure-a na Vercel.`);
  }
  return value;
}

function getR2Client(): { client: S3Client, accountId: string, defaultBucket: string } {
  const accountId = getRequiredEnv("R2_ACCOUNT_ID");
  const accessKeyId = getRequiredEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = getRequiredEnv("R2_SECRET_ACCESS_KEY");
  const defaultBucket = getRequiredEnv("R2_BUCKET_NAME");

  if (!r2ClientInstance) {
    r2ClientInstance = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  return { client: r2ClientInstance, accountId, defaultBucket };
}

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
  // Isso garante que o erro de variável de ambiente só aconteça na hora do upload,
  // e não durante o build (compilação) da Vercel.
  const { client, accountId, defaultBucket } = getR2Client();
  const targetBucket = defaultBucket || bucket;
  
  const command = new PutObjectCommand({
    Bucket: targetBucket,
    Key: path,
    ContentType: contentType,
  });

  try {
    // A URL pré-assinada expira em 1 hora (3600 segundos)
    const presignedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
    
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