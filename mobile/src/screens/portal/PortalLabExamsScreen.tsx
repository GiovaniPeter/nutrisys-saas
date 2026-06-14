import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../../services/api';

export default function PortalLabExamsScreen() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExams() {
      try {
        const response = await api.get('/portal/lab-exams');
        setExams(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Erro ao buscar exames:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchExams();
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
        data={exams}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="flask-empty-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>Nenhum exame cadastrado.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="test-tube" size={24} color="#10b981" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.cardTitle}>{item.examName}</Text>
                {item.date && (
                  <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
                )}
              </View>
            </View>
            <View style={styles.detailsRow}>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Resultado</Text>
                <Text style={styles.detailValue}>{item.result || '-'}</Text>
              </View>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Referência</Text>
                <Text style={styles.detailValue}>{item.referenceValue || '-'}</Text>
              </View>
            </View>
            {item.notes && (
              <View style={styles.notesBox}>
                <Text style={styles.detailLabel}>Observações</Text>
                <Text style={styles.notesText}>{item.notes}</Text>
              </View>
            )}
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
    borderColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  dateText: { fontSize: 13, color: '#6b7280' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailBox: { width: '48%', backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8 },
  detailLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  detailValue: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  notesBox: { marginTop: 12, backgroundColor: '#fef3c7', padding: 12, borderRadius: 8 },
  notesText: { fontSize: 14, color: '#92400e', marginTop: 4 }
});