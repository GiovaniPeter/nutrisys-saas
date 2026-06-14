import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../services/api';

export default function PatientRecallsScreen({ route, navigation }: any) {
  const { patient } = route.params || {};
  const [recalls, setRecalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patient) return;
    async function fetchRecalls() {
      try {
        const response = await api.get(`/recalls?patientId=${patient.id}`);
        setRecalls(Array.isArray(response.data.recalls) ? response.data.recalls : []);
      } catch (error) {
        console.error('Erro ao buscar recordatórios:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecalls();
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

  // Função para somar as calorias totais do recordatório
  const getTotalCalories = (meals: any[]) => {
    if (!meals || !Array.isArray(meals)) return 0;
    let total = 0;
    meals.forEach(meal => {
      if (meal && Array.isArray(meal.items)) {
        meal.items.forEach((item: any) => {
          total += item.calories || 0;
        });
      }
    });
    return Math.round(total);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>Recordatórios 24h de {patient.name}</Text>
      </View>

      <FlatList
        data={recalls}
        keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clock-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>Nenhum recordatório de 24h registrado.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.titleRow}>
                <MaterialCommunityIcons name="clipboard-clock" size={24} color="#8b5cf6" />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.dateTitle}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                  {item.referenceDate && (
                    <Text style={styles.referenceDateText}>Referência: {new Date(item.referenceDate).toLocaleDateString()}</Text>
                  )}
                </View>
              </View>
              <View style={styles.caloriesBadge}>
                <Text style={styles.caloriesText}>{getTotalCalories(item.meals)} kcal</Text>
              </View>
            </View>

            {item.generalNotes && (
              <Text style={styles.generalNotes}>Obs: {item.generalNotes}</Text>
            )}

            <View style={styles.divider} />

            {item.meals && item.meals.map((meal: any, mIdx: number) => (
              <View key={mIdx} style={styles.mealContainer}>
                <Text style={styles.mealLabel}>{meal.label} {meal.time ? `- ${meal.time}` : ''}</Text>
                {meal.items && meal.items.map((foodItem: any, fIdx: number) => (
                  <View key={fIdx} style={styles.foodRow}>
                    <Text style={styles.foodName}>• {foodItem.foodName}</Text>
                    <Text style={styles.foodDetails}>
                      {foodItem.quantity} {foodItem.portion} - {Math.round(foodItem.calories)} kcal
                    </Text>
                  </View>
                ))}
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerInfo: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  list: { padding: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 48 },
  emptyText: { color: '#6b7280', marginTop: 12, textAlign: 'center' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  dateTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  referenceDateText: { fontSize: 12, color: '#6b7280' },
  caloriesBadge: { backgroundColor: '#ede9fe', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  caloriesText: { color: '#7c3aed', fontWeight: 'bold', fontSize: 13 },
  generalNotes: { fontSize: 14, color: '#4b5563', fontStyle: 'italic', marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginBottom: 12 },
  mealContainer: { marginBottom: 12, backgroundColor: '#f9fafb', padding: 12, borderRadius: 8 },
  mealLabel: { fontSize: 15, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
  foodRow: { marginBottom: 6 },
  foodName: { fontSize: 14, color: '#1f2937' },
  foodDetails: { fontSize: 13, color: '#6b7280', marginLeft: 12 }
});