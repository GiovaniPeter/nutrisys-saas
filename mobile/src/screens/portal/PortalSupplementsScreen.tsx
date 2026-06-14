import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../../services/api';

export default function PortalSupplementsScreen() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSupplements() {
      try {
        const response = await api.get('/portal/supplements');
        setPrescriptions(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Erro ao buscar suplementos:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSupplements();
  }, []);

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
        data={prescriptions}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="pill" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>Nenhuma suplementação foi prescrita.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="prescription" size={24} color="#f59e0b" />
                <Text style={styles.cardTitle}>
                  {item.prescribedAt ? new Date(item.prescribedAt).toLocaleDateString() : 'Data não informada'}
                </Text>
              </View>
              {item.duration && (
                <Text style={styles.durationText}>Duração: {item.duration}</Text>
              )}
            </View>

            {item.instructions && (
              <Text style={styles.instructionsText}>Orientação Geral: {item.instructions}</Text>
            )}

            {item.items && item.items.map((subItem: any, idx: number) => (
              <View key={idx} style={styles.itemBox}>
                 <Text style={styles.itemName}>{subItem.name} {subItem.category ? `(${subItem.category})` : ''}</Text>
                 <Text style={styles.itemDose}>Dose: {subItem.dose}</Text>
                 {subItem.form && <Text style={styles.itemForm}>Formato: {subItem.form}</Text>}
                 {subItem.notes && <Text style={styles.itemNotes}>Obs: {subItem.notes}</Text>}
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginLeft: 8 },
  durationText: { fontSize: 13, color: '#92400e', backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontWeight: 'bold' },
  instructionsText: { fontSize: 14, color: '#4b5563', marginBottom: 12, fontStyle: 'italic' },
  itemBox: { marginTop: 8, padding: 12, backgroundColor: '#f3f4f6', borderRadius: 8 },
  itemName: { fontSize: 15, fontWeight: 'bold', color: '#374151', marginBottom: 4 },
  itemDose: { fontSize: 14, color: '#ef4444', fontWeight: 'bold', marginBottom: 2 },
  itemForm: { fontSize: 13, color: '#6b7280' },
  itemNotes: { fontSize: 13, color: '#4b5563', marginTop: 4 }
});