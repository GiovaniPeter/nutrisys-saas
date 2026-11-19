import { formatDocument, isValidCnpj } from "@/lib/brazilian-document";

export function CompanyIdentity() {
  // Dados institucionais públicos (Decreto nº 7.962/2013 e Marco Civil). Nunca utilizar documentos das clínicas assinantes.
  const legalName =
    process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME?.trim() || "Egert Sistemas e Consultoria em Alimentos LTDA";
  const cnpj = process.env.NEXT_PUBLIC_COMPANY_CNPJ?.trim() || "69.642.291/0001-18";
  const address =
    process.env.NEXT_PUBLIC_COMPANY_ADDRESS?.trim() ||
    "Avenida Paulista, 2073, Sala 2220, Bela Vista, São Paulo - SP, CEP 01311-940";
  if (!isValidCnpj(cnpj)) return null;

  return (
    <p className="mt-3 text-xs leading-relaxed" aria-label="Empresa responsável pela plataforma">
      {legalName ? <span className="block font-medium">{legalName}</span> : null}
      <span className="block">CNPJ: {formatDocument(cnpj)}</span>
      {address ? <span className="block">Endereço fiscal: {address}</span> : null}
      <span className="block">Contato e Privacidade (LGPD): contato@clinos.tec.br</span>
    </p>
  );
}
