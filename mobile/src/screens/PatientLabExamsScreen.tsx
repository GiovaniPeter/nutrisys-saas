import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../services/api';

export default function PatientLabExamsScreen({ route }: any) {
  const { patient } = route.params;
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExams() {
      try {
        const response = await api.get(`/lab-exams?patientId=${patient.id}`);
        // Normaliza retorno baseado no q a API envia
        const data = Array.isArray(response.data) ? response.data : response.data.labExams || response.data.exams || response.data.data || [];
        setExams(data);
      } catch (error) {
        console.error('Erro ao buscar exames:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchExams();
  }, [patient.id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={exams}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="flask-empty-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>Nenhum exame laboratorial registrado.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="flask" size={24} color="#ef4444" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.cardTitle}>Data: {new Date(item.examDate).toLocaleDateString()}</Text>
                {item.laboratoryName && <Text style={styles.labName}>{item.laboratoryName}</Text>}
              </View>
            </View>

            <Text style={styles.resultsTitle}>Resultados Encontrados ({item.results?.length || 0}):</Text>

            {item.results && item.results.map((res: any, idx: number) => (
               <View key={idx} style={styles.resultRow}>
                 <Text style={styles.resultName}>{res.name}</Text>
                 <Text style={styles.resultValue}>{res.value} {res.unit}</Text>
               </View>
            ))}
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
    borderColor: '#ef4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderColor: '#f3f4f6', paddingBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  labName: { fontSize: 14, color: '#6b7280' },
  resultsTitle: { fontSize: 14, fontWeight: '600', color: '#4b5563', marginBottom: 8 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  resultName: { fontSize: 14, color: '#374151' },
  resultValue: { fontSize: 14, fontWeight: '500', color: '#1f2937' },
});
