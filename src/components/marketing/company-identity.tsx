import { formatDocument, isValidCnpj } from "@/lib/brazilian-document";

export function CompanyIdentity() {
  // Dados institucionais públicos. Nunca utilizar os documentos das clínicas assinantes.
  const legalName = process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME?.trim() || "Egert Sistemas e Consultoria em Alimentos LTDA";
  const cnpj = process.env.NEXT_PUBLIC_COMPANY_CNPJ?.trim() || "69.642.291/0001-18";
  if (!isValidCnpj(cnpj)) return null;

  return (
    <p className="mt-3 text-xs leading-relaxed" aria-label="Empresa responsável pela plataforma">
      {legalName ? <span className="block font-medium">{legalName}</span> : null}
      <span className="block">CNPJ: {formatDocument(cnpj)}</span>
    </p>
  );
}
