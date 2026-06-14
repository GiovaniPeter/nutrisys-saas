import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../services/api';

export default function PatientEnergyScreen({ route, navigation }: any) {
  const { patient } = route.params || {};
  const [calculations, setCalculations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patient) return;
    async function fetchCalculations() {
      try {
        const response = await api.get(`/energy-calculations?patientId=${patient.id}`);
        setCalculations(Array.isArray(response.data.calculations) ? response.data.calculations : []);
      } catch (error) {
        console.error('Erro ao buscar cálculos de gasto energético:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCalculations();
  }, [patient]);

  if (!patient) {
    return (
      <View style={styles.centered}>
        <Text>Paciente não encontrado.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>Gasto Energético: {patient.name}</Text>
      </View>

      <FlatList
        data={calculations}
        keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calculator" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>Médico(a), nenhum cálculo energético foi salvo ainda.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="fire" size={24} color="#f97316" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.formulaName}>{item.formula}</Text>
                <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>TMB (Basal)</Text>
                <Text style={styles.statValue}>{Math.round(item.basalMetabolicRate)} kcal</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>TEE (Total)</Text>
                <Text style={[styles.statValue, { color: '#f97316' }]}>{Math.round(item.totalEnergyExpenditure)} kcal</Text>
              </View>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailText}>Fator Atividade: {item.activityFactor}</Text>
              <Text style={styles.detailText}>Peso Base: {item.weightKg}kg</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerInfo: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  list: { padding: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 48 },
  emptyText: { color: '#6b7280', marginTop: 12, textAlign: 'center' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  formulaName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  dateText: { fontSize: 13, color: '#6b7280' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statBox: { flex: 1, backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, marginRight: 8, alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#f3f4f6', paddingTop: 12 },
  detailText: { fontSize: 13, color: '#4b5563' }
});