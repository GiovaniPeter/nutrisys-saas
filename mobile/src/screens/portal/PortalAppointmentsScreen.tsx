import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Linking, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../../services/api';

export default function PortalAppointmentsScreen() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const response = await api.get('/portal/appointments');
        setAppointments(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Erro ao buscar consultas:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  const isFuture = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  const handleAddToCalendar = (appointment: any) => {
    const startsAt = new Date(appointment.startsAt);
    const endsAt = appointment.endsAt ? new Date(appointment.endsAt) : new Date(startsAt.getTime() + 60 * 60 * 1000);

    const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const startStr = formatDate(startsAt);
    const endStr = formatDate(endsAt);
    const title = encodeURIComponent('Consulta Nutricional - Clínica ClinOS');
    const details = encodeURIComponent(appointment.notes || 'Consulta nutricional.');

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}`;

    Linking.openURL(url).catch(err => {
      console.error('Erro ao abrir Google Calendar:', err);
      Alert.alert('Erro', 'Não foi possível abrir o calendário.');
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calendar-blank" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>Você não tem consultas agendadas.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const future = isFuture(item.startsAt);
          return (
            <View style={[styles.card, { opacity: future ? 1 : 0.6 }]}>
              <View style={[styles.iconContainer, { backgroundColor: future ? '#dcfce7' : '#f3f4f6' }]}>
                <MaterialCommunityIcons name="calendar-check" size={28} color={future ? '#10b981' : '#9ca3af'} />
              </View>
              <View style={styles.textContent}>
                <Text style={[styles.dateText, { color: future ? '#111827' : '#6b7280' }]}>
                  {new Date(item.startsAt).toLocaleDateString()}
                </Text>
                <Text style={styles.timeText}>
                  {new Date(item.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {item.endsAt && ` - ${new Date(item.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </Text>
                <Text style={styles.statusText}>
                  {future ? 'Consulta Agendada' : 'Consulta Realizada'}
                </Text>
              </View>
              {future && (
                <TouchableOpacity onPress={() => handleAddToCalendar(item)} style={styles.calendarButton}>
                  <MaterialCommunityIcons name="calendar-plus" size={24} color="#3b82f6" />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
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
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center'
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContent: { flex: 1 },
  dateText: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  timeText: { fontSize: 15, color: '#4b5563', marginBottom: 4 },
  statusText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  calendarButton: {
    padding: 8,
    marginLeft: 8,
    justifyContent: 'center',
  }
});
