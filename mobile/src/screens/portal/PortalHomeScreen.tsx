import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ACCOUNT_DELETION_URL, api } from '../../services/api';
import { scheduleMealRemindersFromPlans } from '../../services/notifications';

export default function PortalHomeScreen({ navigation }: any) {
  const [patient, setPatient] = useState<any>(null);
  const [summary, setSummary] = useState({
    nextAppointment: null as any,
    hydrationMl: 0,
    activeGoals: 0,
    latestPlan: null as any,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [meResponse, appointmentsResponse, hydrationResponse, goalsResponse, mealPlansResponse] = await Promise.all([
          api.get('/portal/me'),
          api.get('/portal/appointments'),
          api.get('/portal/hydration'),
          api.get('/portal/goals'),
          api.get('/portal/meal-plans'),
        ]);

        const appointments = Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : [];
        const futureAppointments = appointments
          .filter((appointment: any) => new Date(appointment.startsAt) >= new Date())
          .sort((a: any, b: any) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
        const hydrationLogs = hydrationResponse.data.logs || [];
        const goals = goalsResponse.data.goals || [];
        const mealPlans = Array.isArray(mealPlansResponse.data) ? mealPlansResponse.data : [];

        setPatient(meResponse.data.patient);
        setSummary({
          nextAppointment: futureAppointments[0] || null,
          hydrationMl: hydrationLogs.reduce((total: number, log: any) => total + Number(log.amountMl || 0), 0),
          activeGoals: goals.filter((goal: any) => !goal.completedAt).length,
          latestPlan: mealPlans[0] || null,
        });
        scheduleMealRemindersFromPlans(mealPlans).catch(() => undefined);
      } catch (error) {
        console.error('Erro ao carregar dados do portal:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@NutriPlan:token');
    await AsyncStorage.removeItem('@NutriPlan:user');
    await AsyncStorage.removeItem('@NutriPlan:role');
    navigation.replace('Login');
  };

  const handleOpenAccountDeletion = async () => {
    try {
      await Linking.openURL(ACCOUNT_DELETION_URL);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir a página de exclusão de conta.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="account-circle" size={80} color="#10b981" />
        <Text style={styles.greeting}>Olá, {patient?.name?.split(' ')[0]}!</Text>
        <Text style={styles.subtitle}>Bem-vindo ao seu portal de acompanhamento.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Seu Nutricionista / Clínica</Text>
        <Text style={styles.infoText}>{patient?.organization?.name || 'Clínica NutreClin'}</Text>
      </View>

      {patient?.goal && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Seu Objetivo</Text>
          <Text style={styles.infoText}>{patient.goal}</Text>
        </View>
      )}

      <Text style={styles.menuTitle}>Resumo de Hoje</Text>

      <View style={styles.summaryGrid}>
        <TouchableOpacity style={styles.summaryCard} onPress={() => navigation.navigate('PortalAppointments')}>
          <MaterialCommunityIcons name="calendar-clock" size={24} color="#10b981" />
          <Text style={styles.summaryLabel}>Próxima consulta</Text>
          <Text style={styles.summaryValue}>
            {summary.nextAppointment ? formatDateTime(summary.nextAppointment.startsAt) : 'Sem agenda'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.summaryCard} onPress={() => navigation.navigate('PortalHydration')}>
          <MaterialCommunityIcons name="cup-water" size={24} color="#3b82f6" />
          <Text style={styles.summaryLabel}>Água hoje</Text>
          <Text style={styles.summaryValue}>{summary.hydrationMl} ml</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.summaryCard} onPress={() => navigation.navigate('PortalGoals')}>
          <MaterialCommunityIcons name="flag-checkered" size={24} color="#ef4444" />
          <Text style={styles.summaryLabel}>Metas ativas</Text>
          <Text style={styles.summaryValue}>{summary.activeGoals}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.summaryCard} onPress={() => navigation.navigate('PortalMealPlans')}>
          <MaterialCommunityIcons name="food-apple" size={24} color="#10b981" />
          <Text style={styles.summaryLabel}>Plano atual</Text>
          <Text style={styles.summaryValue} numberOfLines={1}>
            {summary.latestPlan?.name || 'Nenhum plano'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.menuTitle}>Minhas Ações</Text>

      <View style={styles.menuGrid}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PortalFoodDiary')}>
          <View style={[styles.iconCircle, { backgroundColor: '#fef3c7' }]}>
            <MaterialCommunityIcons name="book-open-variant" size={32} color="#f59e0b" />
          </View>
          <Text style={styles.menuText}>Diário Alimentar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PortalMealPlans')}>
          <View style={[styles.iconCircle, { backgroundColor: '#dcfce7' }]}>
            <MaterialCommunityIcons name="food-apple" size={32} color="#10b981" />
          </View>
          <Text style={styles.menuText}>Planos Alimentares</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PortalChat')}>
          <View style={[styles.iconCircle, { backgroundColor: '#d1fae5' }]}>
             <MaterialCommunityIcons name="chat-processing" size={32} color="#10b981" />
          </View>
          <Text style={styles.menuText}>Chat com Nutri</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PortalGoals')}>
          <View style={[styles.iconCircle, { backgroundColor: '#fee2e2' }]}>
            <MaterialCommunityIcons name="flag-checkered" size={32} color="#ef4444" />
          </View>
          <Text style={styles.menuText}>Metas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PortalBodyRecords')}>
          <View style={[styles.iconCircle, { backgroundColor: '#e0e7ff' }]}>
            <MaterialCommunityIcons name="tape-measure" size={32} color="#4f46e5" />
          </View>
          <Text style={styles.menuText}>Avaliações Corpo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PortalLabExams')}>
          <View style={[styles.iconCircle, { backgroundColor: '#f3f4f6' }]}>
            <MaterialCommunityIcons name="test-tube" size={32} color="#4b5563" />
          </View>
          <Text style={styles.menuText}>Exames</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PortalSupplements')}>
          <View style={[styles.iconCircle, { backgroundColor: '#fef3c7' }]}>
            <MaterialCommunityIcons name="pill" size={32} color="#f59e0b" />
          </View>
          <Text style={styles.menuText}>Suplementos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PortalMaterials')}>
          <View style={[styles.iconCircle, { backgroundColor: '#e0f2fe' }]}>
            <MaterialCommunityIcons name="folder-open" size={32} color="#0284c7" />
          </View>
          <Text style={styles.menuText}>Materiais</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PortalAppointments')}>
          <View style={[styles.iconCircle, { backgroundColor: '#dcfce7' }]}>
            <MaterialCommunityIcons name="calendar" size={32} color="#16a34a" />
          </View>
          <Text style={styles.menuText}>Minha Agenda</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PortalHydration')}>
          <View style={[styles.iconCircle, { backgroundColor: '#e0f2fe' }]}>
             <MaterialCommunityIcons name="cup-water" size={32} color="#3b82f6" />
          </View>
          <Text style={styles.menuText}>Hidratação</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PortalProfile')}>
          <View style={[styles.iconCircle, { backgroundColor: '#f3f4f6' }]}>
             <MaterialCommunityIcons name="account-heart" size={32} color="#4b5563" />
          </View>
          <Text style={styles.menuText}>Meu Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('AppSettings')}>
          <View style={[styles.iconCircle, { backgroundColor: '#f3f4f6' }]}>
             <MaterialCommunityIcons name="cog-outline" size={32} color="#4b5563" />
          </View>
          <Text style={styles.menuText}>Config. App</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={24} color="#ef4444" />
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteAccountButton} onPress={handleOpenAccountDeletion}>
        <MaterialCommunityIcons name="account-remove-outline" size={22} color="#b91c1c" />
        <Text style={styles.deleteAccountText}>Solicitar exclusão de conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', padding: 32, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginTop: 16 },
  subtitle: { fontSize: 16, color: '#6b7280', marginTop: 4, textAlign: 'center' },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width:0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
  infoText: { fontSize: 16, color: '#4b5563' },
  menuTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginHorizontal: 16, marginTop: 24, marginBottom: 12 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, justifyContent: 'space-between' },
  summaryCard: { backgroundColor: '#fff', width: '48%', padding: 14, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width:0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  summaryLabel: { color: '#6b7280', fontSize: 12, fontWeight: '700', marginTop: 8 },
  summaryValue: { color: '#111827', fontSize: 15, fontWeight: 'bold', marginTop: 4 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, justifyContent: 'space-between' },
  menuItem: { backgroundColor: '#fff', width: '48%', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width:0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  menuText: { fontSize: 15, fontWeight: '600', color: '#374151', textAlign: 'center' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 32, marginTop: 32, marginBottom: 12, padding: 16, borderRadius: 8, backgroundColor: '#fee2e2' },
  logoutText: { marginLeft: 8, fontSize: 16, fontWeight: 'bold', color: '#ef4444' },
  deleteAccountButton: { alignItems: 'center', backgroundColor: '#fff', borderColor: '#fecaca', borderRadius: 8, borderWidth: 1, flexDirection: 'row', justifyContent: 'center', marginBottom: 32, marginHorizontal: 32, padding: 14 },
  deleteAccountText: { color: '#b91c1c', fontSize: 14, fontWeight: '800', marginLeft: 8 }
});
