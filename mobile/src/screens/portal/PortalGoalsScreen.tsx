import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../../services/api';

export default function PortalGoalsScreen() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await api.get('/portal/goals');
      const data = response.data.goals || [];
      setGoals(data);
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProgress = async (goalId: string) => {
    try {
      await api.patch('/portal/goals', { goalId, delta: 1 });
      await fetchGoals();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a meta.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    const isCompleted = item.completedAt != null || Number(item.current) >= Number(item.target);
    const progress = Math.min((Number(item.current) / Number(item.target)) * 100, 100);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={[styles.title, isCompleted && styles.completedTitle]}>{item.title || item.description}</Text>
          {isCompleted && <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />}
        </View>

        <Text style={styles.deadline}>
          {item.dueDate ? `Prazo: ${new Date(item.dueDate).toLocaleDateString()}` : 'Sem prazo definido'}
        </Text>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {Number(item.current || 0)} / {Number(item.target || 0)} {item.unit || ''}
          </Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }, isCompleted && { backgroundColor: '#10b981' }]} />
          </View>
        </View>

        {!isCompleted && (
          <TouchableOpacity style={styles.progressButton} onPress={() => handleProgress(item.id)}>
            <MaterialCommunityIcons name="plus" size={20} color="#fff" />
            <Text style={styles.buttonText}>Avançar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={goals}
        keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="flag-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>Nenhuma meta ativa no momento.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width:0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', flex: 1 },
  completedTitle: { color: '#9ca3af', textDecorationLine: 'line-through' },
  deadline: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  progressContainer: { marginBottom: 16 },
  progressText: { fontSize: 14, fontWeight: '600', color: '#4b5563', marginBottom: 8, textAlign: 'right' },
  progressBarBg: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#ef4444' },
  progressButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ef4444', paddingVertical: 10, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginLeft: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 64 },
  emptyText: { color: '#9ca3af', marginTop: 16, fontSize: 16, textAlign: 'center' }
});
