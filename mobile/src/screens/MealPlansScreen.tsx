import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';

export default function MealPlansScreen({ route }: any) {
  // Pega o patientId da rota caso tenha sido passado (vinda do perfil do paciente)
  const patientId = route?.params?.patientId;

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMealPlans = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const url = patientId ? `/meal-plans?patientId=${patientId}` : '/meal-plans';
      const response = await api.get(url);
      const data = Array.isArray(response.data) ? response.data : response.data.mealPlans || response.data.data || [];
      setPlans(data);
    } catch (error) {
      console.error('Erro ao buscar planos alimentares:', error);
      Alert.alert('Erro', 'Não foi possível carregar os planos alimentares.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [patientId]);

  useFocusEffect(
    useCallback(() => {
      fetchMealPlans();
    }, [fetchMealPlans])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMealPlans(true);
  };

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
        data={plans}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma dieta encontrada.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Text style={styles.title}>{item.name || 'Plano sem nome'}</Text>
            {item.totalCalories && <Text style={styles.calories}>{item.totalCalories} kcal</Text>}
            <Text style={styles.subtitle}>Paciente: {item.patient?.name || 'Não atribuído'}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
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
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#6b7280',
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  calories: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  }
});
