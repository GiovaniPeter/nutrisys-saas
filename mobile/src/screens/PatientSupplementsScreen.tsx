import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../services/api';

export default function PatientSupplementsScreen({ route }: any) {
  const { patient } = route.params;
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSupplements() {
      try {
        const response = await api.get(`/supplement-prescriptions?patientId=${patient.id}`);
        const data = Array.isArray(response.data) ? response.data : response.data.prescriptions || response.data.data || [];
        setPrescriptions(data);
      } catch (error) {
        console.error('Erro ao buscar suplementos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSupplements();
  }, [patient.id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={prescriptions}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="pill" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>Nenhuma prescrição de suplemento para este paciente.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="pill" size={24} color="#f59e0b" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.cardTitle}>Prescrito em: {new Date(item.prescribedAt).toLocaleDateString()}</Text>
                {item.duration && <Text style={styles.duration}>Duração: {item.duration}</Text>}
              </View>
            </View>

            {item.items && item.items.map((sup: any, idx: number) => (
               <View key={idx} style={styles.itemBox}>
                 <Text style={styles.itemName}>{sup.name}</Text>
                 <Text style={styles.itemDose}>{sup.dose} - {sup.frequency}</Text>
                 {sup.instructions && <Text style={styles.itemInstructions}>{sup.instructions}</Text>}
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
    borderColor: '#f59e0b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  duration: { fontSize: 14, color: '#6b7280' },
  itemBox: { marginTop: 8, padding: 12, backgroundColor: '#f3f4f6', borderRadius: 8 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#374151' },
  itemDose: { fontSize: 14, color: '#4b5563', marginTop: 4 },
  itemInstructions: { fontSize: 13, color: '#9ca3af', fontStyle: 'italic', marginTop: 4 }
});
