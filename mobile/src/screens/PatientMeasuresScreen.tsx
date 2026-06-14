import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { api } from '../services/api';

export default function PatientMeasuresScreen({ route }: any) {
  const { patient } = route.params;
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeasures() {
      try {
        const response = await api.get(`/body-records?patientId=${patient.id}`);
        const data = Array.isArray(response.data) ? response.data : response.data.records || [];

        // Ordena da mais antiga para a mais nova para o gráfico ir da esq -> para a direita
        const sortedData = data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setRecords(sortedData);
      } catch (error) {
        console.error('Erro ao buscar medidas:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMeasures();
  }, [patient.id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  // Prepara os dados para o Gráfico de Evolução (Peso)
  const chartLabels = records.map(r => new Date(r.date || r.createdAt).toLocaleDateString().slice(0, 5));
  let chartDataValues = records.map(r => Number(r.weightKg) || 0);

  // Fallback caso não tenha nenhum peso para o gráfico não quebrar
  if (chartDataValues.length === 0) {
    chartDataValues = [0];
  }

  return (
    <ScrollView style={styles.container}>

      {/* Se o paciente tiver medidas gravadas, exibe o gráfico visual acima */}
      {records.length > 0 ? (
        <View style={styles.chartWrapper}>
          <Text style={styles.chartTitle}>Evolução de Peso (kg)</Text>
          <LineChart
            data={{
              labels: chartLabels.length > 0 ? chartLabels : [''],
              datasets: [{ data: chartDataValues }]
            }}
            width={Dimensions.get('window').width - 32} // Largura da tela - margens
            height={220}
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`, // violet-500
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // gray-500
              style: { borderRadius: 16 },
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: '#8b5cf6'
              }
            }}
            bezier
            style={styles.chart}
          />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
           <Text style={styles.emptyText}>Nenhuma avaliação antropométrica cadastrada ainda.</Text>
        </View>
      )}

      {/* Histórico completo em texto */}
      <View style={styles.historyContainer}>
        <Text style={styles.sectionTitle}>Histórico Detalhado</Text>
        {records.slice().reverse().map((record, index) => ( // Reverse para mostrar os mais recentes no topo
          <View key={index} style={styles.recordCard}>
            <Text style={styles.recordDate}>
              Data da Avaliação: {new Date(record.date || record.createdAt).toLocaleDateString()}
            </Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Peso</Text>
                <Text style={styles.metricValue}>{record.weightKg ? `${record.weightKg} kg` : '-'}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Gordura Corporais</Text>
                <Text style={styles.metricValue}>{record.bodyFatPct ? `${record.bodyFatPct}%` : '-'}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Cintura</Text>
                <Text style={styles.metricValue}>{record.waistCm ? `${record.waistCm} cm` : '-'}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Quadril</Text>
                <Text style={styles.metricValue}>{record.hipCm ? `${record.hipCm} cm` : '-'}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 16,
  },
  chartWrapper: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  historyContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  recordCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderColor: '#8b5cf6',
  },
  recordDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4b5563',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  }
});
