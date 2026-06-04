import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const foodName = searchParams.get('foodName');
    const targetCaloriesParam = searchParams.get('targetCalories');

    if (!foodName || !targetCaloriesParam) {
      return NextResponse.json({ error: 'Parâmetros foodName e targetCalories são obrigatórios' }, { status: 400 });
    }

    const targetCalories = parseFloat(targetCaloriesParam);

    // 1. Encontrar o alimento original
    const originalFood = await prisma.food.findFirst({
      where: { name: { equals: foodName, mode: 'insensitive' } }
    });

    if (!originalFood) {
      return NextResponse.json({ error: 'Alimento original não encontrado no banco de dados' }, { status: 404 });
    }

    if (!originalFood.category) {
      return NextResponse.json({ error: 'O alimento original não possui categoria, não é possível buscar substitutos' }, { status: 400 });
    }

    // 2. Buscar outros alimentos da mesma categoria
    const substitutes = await prisma.food.findMany({
      where: {
        category: originalFood.category,
        id: { not: originalFood.id }
      },
      take: 20, // Limitar a 20 sugestões para não pesar
      orderBy: { name: 'asc' }
    });

    // 3. Calcular a porção equivalente de cada substituto para bater a mesma quantidade de calorias
    // Consideramos que as calorias do banco (substitute.calories) são para a porção do banco (ex: 100g).
    // O backend retorna um multiplicador: se a Kcal alvo é 130 e o alimento tem 260 Kcal / 100g, ele precisa de 0.5 (metade da porção original do banco).
    
    const calculatedSubstitutes = substitutes.map(sub => {
      // Evitar divisão por zero caso haja alimentos cadastrados sem caloria
      const subCal = Number(sub.calories) > 0 ? Number(sub.calories) : 1;
      
      // Quantas vezes a porção base dele eu preciso pra bater a caloria alvo?
      const multiplier = targetCalories / subCal;

      return {
        id: sub.id,
        name: sub.name,
        category: sub.category,
        basePortion: sub.portion, // Ex: "100g" ou "1 colher"
        baseCalories: Number(sub.calories),
        suggestedMultiplier: multiplier.toFixed(2), // O front pode multiplicar se a basePortion for "100g", fica 100 * multiplier
        targetCalories: targetCalories
      };
    });

    return NextResponse.json({ 
      success: true, 
      originalCategory: originalFood.category,
      substitutes: calculatedSubstitutes 
    });

  } catch (error: any) {
    console.error('Erro na rota de substitutos:', error);
    return NextResponse.json({ error: 'Erro ao calcular substituições' }, { status: 500 });
  }
}
