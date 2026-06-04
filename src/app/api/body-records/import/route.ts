import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import Papa from 'papaparse';

export async function POST(request: Request) {
  try {
    const session = await requireAuth(request);

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const text = await file.text();

    // Fazendo o parse do CSV
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    const rows: any[] = parsed.data;

    let successCount = 0;
    let notFoundCount = 0;
    const notFoundNames: string[] = [];

    // Tentar descobrir os nomes das colunas
    if (rows.length === 0) {
      return NextResponse.json({ error: 'O arquivo CSV está vazio ou inválido.' }, { status: 400 });
    }

    const headers = Object.keys(rows[0]).map(h => h.toLowerCase().trim());
    
    // Heurística de colunas
    const nameCol = Object.keys(rows[0]).find(k => k.toLowerCase().includes('nome') || k.toLowerCase().includes('name') || k.toLowerCase().includes('paciente'));
    const weightCol = Object.keys(rows[0]).find(k => k.toLowerCase().includes('peso') || k.toLowerCase().includes('weight'));
    const fatCol = Object.keys(rows[0]).find(k => k.toLowerCase().includes('pbf') || k.toLowerCase().includes('gordura') || k.toLowerCase().includes('fat'));

    if (!nameCol) {
      return NextResponse.json({ error: 'Não foi possível identificar a coluna de "Nome" no CSV.' }, { status: 400 });
    }

    // Buscando todos os pacientes da organização para otimizar o match
    const patients = await prisma.patient.findMany({
      where: { organizationId: session.organizationId },
      select: { id: true, name: true }
    });

    for (const row of rows) {
      const rowName = row[nameCol]?.trim();
      if (!rowName) continue;

      const rowWeight = weightCol ? parseFloat(row[weightCol].toString().replace(',', '.')) : null;
      const rowFat = fatCol ? parseFloat(row[fatCol].toString().replace(',', '.')) : null;

      // Se não tem peso nem gordura, pula
      if (isNaN(rowWeight!) && isNaN(rowFat!)) continue;

      // Buscar paciente (busca insensível a maiúsculas e minúsculas simples via Javascript para evitar sobrecarga no DB)
      const matchedPatient = patients.find(p => p.name.toLowerCase() === rowName.toLowerCase());

      if (matchedPatient) {
        await prisma.bodyRecord.create({
          data: {
            patientId: matchedPatient.id,
            date: new Date(),
            weightKg: !isNaN(rowWeight!) ? rowWeight : null,
            bodyFatPct: !isNaN(rowFat!) ? rowFat : null,
            notes: 'Importado automaticamente via arquivo de Bioimpedância.'
          }
        });
        successCount++;
      } else {
        notFoundCount++;
        notFoundNames.push(rowName);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Importação concluída. ${successCount} atualizados. ${notFoundCount} não encontrados.`,
      details: {
        successCount,
        notFoundCount,
        notFoundNames: notFoundNames.slice(0, 10) // Retorna no máx 10 para não estourar o JSON
      }
    });

  } catch (error: any) {
    console.error('Erro na importação de bioimpedância:', error);
    return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 });
  }
}
