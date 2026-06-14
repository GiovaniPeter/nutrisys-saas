import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { scheduleHydrationReminders } from '../../services/notifications';

export default function PortalHydrationScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchHydrationLogs();
    scheduleHydrationReminders().catch(() => undefined);
  }, []);

  const fetchHydrationLogs = async () => {
    try {
      const response = await api.get('/portal/hydration');
      const data = response.data.logs || [];
      setLogs(data);
    } catch (error) {
      console.error('Erro ao buscar hidratação:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentTotal = logs.reduce((sum, log) => sum + Number(log.amountMl || 0), 0);
  const dailyGoal = 2500; // Pode ser trazido da API nas configurações do paciente depois

  const progressPercentage = Math.min((currentTotal / dailyGoal) * 100, 100);

  const addWater = async (amount: number) => {
    setSubmitting(true);
    try {
      await api.post('/portal/hydration', { amountMl: amount, date: new Date().toISOString() });
      await fetchHydrationLogs();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível registrar a hidratação.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Hoje</Text>
        <Text style={styles.headerTotal}>{currentTotal} ml</Text>
        <Text style={styles.headerGoal}>/ {dailyGoal} ml</Text>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
        </View>
      </View>

      <View style={styles.quickAddContainer}>
        <Text style={styles.quickAddTitle}>Adicionar copo/garrafa:</Text>
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.amountButton} onPress={() => addWater(150)} disabled={submitting}>
            <MaterialCommunityIcons name="cup" size={24} color="#3b82f6" />
            <Text style={styles.amountText}>150 ml</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.amountButton} onPress={() => addWater(250)} disabled={submitting}>
            <MaterialCommunityIcons name="cup-water" size={24} color="#3b82f6" />
            <Text style={styles.amountText}>250 ml</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.amountButton} onPress={() => addWater(500)} disabled={submitting}>
            <MaterialCommunityIcons name="water-pump" size={24} color="#3b82f6" />
            <Text style={styles.amountText}>500 ml</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.listTitle}>Histórico de Hoje</Text>
      <FlatList
        data={logs}
        keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Você ainda não bebeu água hoje, vamos começar?</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.logRow}>
            <View style={styles.logLeft}>
              <MaterialCommunityIcons name="water" size={24} color="#3b82f6" />
              <Text style={styles.logAmount}>{item.amountMl} ml</Text>
            </View>
            <Text style={styles.logTime}>{item.time}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBox: { backgroundColor: '#fff', padding: 24, alignItems: 'center', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  headerTitle: { fontSize: 16, color: '#6b7280', marginBottom: 4 },
  headerTotal: { fontSize: 36, fontWeight: 'bold', color: '#1f2937' },
  headerGoal: { fontSize: 16, color: '#9ca3af', marginBottom: 16 },
  progressBarBg: { width: '100%', height: 12, backgroundColor: '#e0f2fe', borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#3b82f6' },
  quickAddContainer: { padding: 16, backgroundColor: '#fff', marginTop: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  quickAddTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  amountButton: { alignItems: 'center', backgroundColor: '#eff6ff', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, minWidth: 90 },
  amountText: { color: '#2563eb', fontWeight: 'bold', marginTop: 4 },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  logLeft: { flexDirection: 'row', alignItems: 'center' },
  logAmount: { fontSize: 16, fontWeight: '600', color: '#374151', marginLeft: 8 },
  logTime: { fontSize: 14, color: '#6b7280' },
  emptyText: { textAlign: 'center', color: '#9ca3af', marginTop: 32 }
});
