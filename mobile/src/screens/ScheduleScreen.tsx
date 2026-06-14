import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';

export default function ScheduleScreen() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const response = await api.get('/appointments');
      const data = Array.isArray(response.data) ? response.data : response.data.appointments || response.data.data || [];
      setAppointments(data);
    } catch (error) {
      console.error('Erro ao buscar agenda:', error);
      Alert.alert('Erro', 'Não foi possível carregar sua agenda.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [fetchAppointments])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments(true);
  };

  const handleAddToCalendar = (appointment: any) => {
    const startsAt = new Date(appointment.startsAt || appointment.date || appointment.startTime || new Date());
    const endsAt = appointment.endsAt ? new Date(appointment.endsAt) : new Date(startsAt.getTime() + 60 * 60 * 1000);

    const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const startStr = formatDate(startsAt);
    const endStr = formatDate(endsAt);
    const title = encodeURIComponent(`Consulta Nutricional: ${appointment.patient?.name || 'Paciente'}`);
    const details = encodeURIComponent(appointment.notes || 'Consulta marcada pelo NutreClin.');

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}`;

    Linking.openURL(url).catch(err => {
      console.error('Erro ao abrir Google Calendar:', err);
      Alert.alert('Erro', 'Não foi possível abrir o calendário.');
    });
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
      <Text style={styles.dateHeader}>Minha Agenda</Text>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Sem consultas marcadas.</Text>}
        renderItem={({ item }) => {
          // Formatando a data e hora vinda do banco
          const dateObj = new Date(item.startsAt || item.date || item.startTime || new Date());
          const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const patientName = item.patient?.name || 'Paciente sem nome';

          return (
            <View style={styles.card}>
              <View style={styles.timeContainer}>
                <Text style={styles.time}>{time}</Text>
              </View>
              <View style={styles.detailsContainer}>
                <Text style={styles.patient}>{patientName}</Text>
                <Text style={styles.type}>{item.status || 'Agendado'}</Text>
              </View>
              <TouchableOpacity onPress={() => handleAddToCalendar(item)} style={styles.calendarButton}>
                <MaterialCommunityIcons name="calendar-plus" size={24} color="#3b82f6" />
              </TouchableOpacity>
            </View>
          );
        }}
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
  dateHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    padding: 16,
    backgroundColor: '#e5e7eb',
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
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
  timeContainer: {
    justifyContent: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderColor: '#e5e7eb',
  },
  time: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  detailsContainer: {
    paddingLeft: 16,
    justifyContent: 'center',
    flex: 1,
  },
  patient: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  type: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  calendarButton: {
    justifyContent: 'center',
    padding: 8,
  }
});
