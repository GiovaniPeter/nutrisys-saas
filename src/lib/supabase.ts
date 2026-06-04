import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL ou Key não estão configuradas no .env');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    }
  });
}

/**
 * Função utilitária para fazer upload de arquivos no Supabase Storage
 * @param bucket Nome do bucket (ex: 'nutriplan-uploads')
 * @param path Caminho do arquivo no bucket (ex: 'avatars/usuario1.png')
 * @param fileBuffer O buffer do arquivo
 * @param contentType O mime-type do arquivo (ex: 'image/jpeg')
 * @returns A URL pública do arquivo enviado
 */
export async function uploadFileToStorage(
  bucket: string,
  path: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Erro no upload para o Supabase: ${error.message}`);
  }

  // Retorna a URL pública
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrlData.publicUrl;
}
