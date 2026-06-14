import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Dimensions, Alert, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../services/api';

export default function PortalBodyRecordsScreen() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecords = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const response = await api.get('/portal/body-records');
      const data = Array.isArray(response.data) ? response.data : [];
      // Ordena da mais antiga para a mais nova para o gráfico ir da esq -> direita
      const sortedData = data.sort((a: any, b: any) => new Date(a.date || a.createdAt).getTime() - new Date(b.date || b.createdAt).getTime());
      setRecords(sortedData);
    } catch (error) {
      console.error('Erro ao buscar evolução corporal:', error);
      Alert.alert('Erro', 'Não foi possível carregar a evolução corporal.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRecords();
    }, [fetchRecords])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecords(true);
  };

  const chartLabels = records.map(r => new Date(r.date || r.createdAt).toLocaleDateString().slice(0, 5));
  let chartDataValues = records.map(r => Number(r.weight) || 0);

  if (chartDataValues.length === 0) {
    chartDataValues = [0];
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={[...records].reverse()}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />}
        ListHeaderComponent={
          records.length > 0 ? (
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
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // emerald-500
                  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // gray-500
                  style: { borderRadius: 16 },
                  propsForDots: {
                    r: '5',
                    strokeWidth: '2',
                    stroke: '#10b981'
                  }
                }}
                bezier
                style={styles.chart}
              />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="tape-measure" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>Nenhuma avaliação corporal encontrada.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="calendar-check" size={24} color="#10b981" />
              <Text style={styles.dateText}>
                {item.date ? new Date(item.date).toLocaleDateString() : 'Data não informada'}
              </Text>
            </View>

            <View style={styles.statsGrid}>
              {item.weight && <View style={styles.statBox}><Text style={styles.statLabel}>Peso</Text><Text style={styles.statValue}>{item.weight} kg</Text></View>}
              {item.height && <View style={styles.statBox}><Text style={styles.statLabel}>Altura</Text><Text style={styles.statValue}>{item.height} cm</Text></View>}
              {item.bodyFat && <View style={styles.statBox}><Text style={styles.statLabel}>% de Gordura</Text><Text style={styles.statValue}>{item.bodyFat} %</Text></View>}
              {item.muscleMass && <View style={styles.statBox}><Text style={styles.statLabel}>M. Muscular</Text><Text style={styles.statValue}>{item.muscleMass} kg</Text></View>}
              {item.waist && <View style={styles.statBox}><Text style={styles.statLabel}>Cintura</Text><Text style={styles.statValue}>{item.waist} cm</Text></View>}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 64 },
  emptyText: { textAlign: 'center', marginTop: 16, color: '#6b7280', fontSize: 16 },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderColor: '#10b981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dateText: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginLeft: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statBox: { width: '48%', backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, marginBottom: 8 },
  statLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '600', color: '#374151' },
  chartWrapper: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  }
});