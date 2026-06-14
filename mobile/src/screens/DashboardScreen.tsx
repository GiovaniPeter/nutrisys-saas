import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

interface KpiData {
  metrics: {
    totalPatients: number;
    activePatients: number;
    currentMonthRevenueCents: number;
    revenueTrend: number;
    returnRate: number;
    noShowRate: number;
    averageTicketCents: number;
    completedAppointments: number;
    noShows: number;
    totalPastAppointments: number;
  };
  monthlyRevenue: { label: string; valueCents: number }[];
}

interface Appointment {
  id: string;
  startsAt: string;
  type: string;
  status: string;
  patient: { id: string; name: string };
}

export default function DashboardScreen({ navigation }: any) {
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem('@NutriPlan:user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user.name?.split(' ')[0] || 'Usuário');
      }

      // Buscar KPIs
      const kpiRes = await api.get('/kpis');
      setKpis(kpiRes.data);

      // Buscar consultas de hoje
      const today = new Date();
      const from = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const to = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();
      const apptRes = await api.get('/appointments', { params: { from, to } });
      setTodayAppointments(apptRes.data.appointments || []);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      // Não mostra erro na carga inicial — dados podem simplesmente não existir ainda
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const formatCurrency = (cents: number) => {
    return `R$ ${(cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const formatTime = (isoDate: string) => {
    const d = new Date(isoDate);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const pendingToday = todayAppointments.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Bem-vindo de volta,</Text>
          <Text style={styles.headerTitle}>{userName}</Text>
        </View>
        <MaterialCommunityIcons name="account-circle" size={48} color="#10b981" />
      </View>

      {/* KPI Cards */}
      {kpis && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          <View style={styles.kpiRow}>
            <View style={[styles.kpiCard, { backgroundColor: '#ecfdf5' }]}>
              <MaterialCommunityIcons name="account-group" size={28} color="#10b981" />
              <Text style={styles.kpiValue}>{kpis.metrics.totalPatients}</Text>
              <Text style={styles.kpiLabel}>Pacientes</Text>
              <Text style={styles.kpiSub}>{kpis.metrics.activePatients} ativos</Text>
            </View>
            <View style={[styles.kpiCard, { backgroundColor: '#eff6ff' }]}>
              <MaterialCommunityIcons name="calendar-check" size={28} color="#3b82f6" />
              <Text style={styles.kpiValue}>{todayAppointments.length}</Text>
              <Text style={styles.kpiLabel}>Consultas Hoje</Text>
              <Text style={styles.kpiSub}>{pendingToday.length} pendentes</Text>
            </View>
          </View>
          <View style={styles.kpiRow}>
            <View style={[styles.kpiCard, { backgroundColor: '#fefce8' }]}>
              <MaterialCommunityIcons name="currency-usd" size={28} color="#f59e0b" />
              <Text style={styles.kpiValue}>{formatCurrency(kpis.metrics.currentMonthRevenueCents)}</Text>
              <Text style={styles.kpiLabel}>Receita do Mês</Text>
              <Text style={[styles.kpiSub, { color: kpis.metrics.revenueTrend >= 0 ? '#10b981' : '#ef4444' }]}>
                {kpis.metrics.revenueTrend >= 0 ? '↑' : '↓'} {Math.abs(kpis.metrics.revenueTrend).toFixed(0)}%
              </Text>
            </View>
            <View style={[styles.kpiCard, { backgroundColor: '#faf5ff' }]}>
              <MaterialCommunityIcons name="chart-line" size={28} color="#8b5cf6" />
              <Text style={styles.kpiValue}>{kpis.metrics.returnRate.toFixed(0)}%</Text>
              <Text style={styles.kpiLabel}>Taxa de Retorno</Text>
              <Text style={styles.kpiSub}>{kpis.metrics.noShowRate.toFixed(0)}% no-show</Text>
            </View>
          </View>
        </View>
      )}

      {/* Consultas de Hoje */}
      {todayAppointments.length > 0 && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Agenda de Hoje</Text>
          {todayAppointments.slice(0, 5).map((appt) => (
            <TouchableOpacity
              key={appt.id}
              style={styles.appointmentCard}
              onPress={() => navigation.navigate('PatientDetails', { patient: { id: appt.patient.id, name: appt.patient.name } })}
            >
              <View style={styles.appointmentTime}>
                <Text style={styles.timeText}>{formatTime(appt.startsAt)}</Text>
                <View style={[styles.statusDot, {
                  backgroundColor: appt.status === 'COMPLETED' ? '#10b981' :
                    appt.status === 'CONFIRMED' ? '#3b82f6' :
                    appt.status === 'CANCELED' ? '#ef4444' : '#f59e0b'
                }]} />
              </View>
              <View style={styles.appointmentInfo}>
                <Text style={styles.appointmentPatient}>{appt.patient.name}</Text>
                <Text style={styles.appointmentType}>{appt.type || 'Consulta'}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
          {todayAppointments.length > 5 && (
            <TouchableOpacity onPress={() => navigation.navigate('ScheduleTab')}>
              <Text style={styles.viewAllText}>Ver todas ({todayAppointments.length})</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Acesso Rápido */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Acesso Rápido</Text>
        <View style={styles.cardsContainer}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PatientsTab')}>
            <MaterialCommunityIcons name="account-group" size={32} color="#10b981" style={styles.icon} />
            <Text style={styles.cardTitle}>Pacientes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ScheduleTab')}>
            <MaterialCommunityIcons name="calendar-clock" size={32} color="#10b981" style={styles.icon} />
            <Text style={styles.cardTitle}>Agenda</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MealPlans')}>
            <MaterialCommunityIcons name="food-apple" size={32} color="#10b981" style={styles.icon} />
            <Text style={styles.cardTitle}>Dietas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Financial')}>
            <MaterialCommunityIcons name="currency-usd" size={32} color="#10b981" style={styles.icon} />
            <Text style={styles.cardTitle}>Financeiro</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  welcomeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    padding: 16,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  // KPI Cards
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  kpiCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  kpiLabel: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 4,
  },
  kpiSub: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  // Consultas Hoje
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  appointmentTime: {
    alignItems: 'center',
    marginRight: 14,
    width: 52,
  },
  timeText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentPatient: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  appointmentType: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  viewAllText: {
    color: '#10b981',
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 8,
    fontSize: 14,
  },
  // Acesso Rápido
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  }
});
