import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

interface Patient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  sex: string | null;
  birthDate: string | null;
  heightCm: number | null;
  weightKg: number | null;
  goal: string | null;
  notes: string | null;
  lgpdConsent: boolean;
}

export default function PatientDetailsScreen({ route, navigation }: any) {
  const patientParam = route.params?.patient;
  const patientId = patientParam?.id || route.params?.patientId;

  const [patient, setPatient] = useState<Patient | null>(patientParam || null);
  const [loading, setLoading] = useState(!patientParam);

  const loadPatient = useCallback(async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      const res = await api.get(`/patients/${patientId}`);
      setPatient(res.data.patient || res.data);
    } catch (err) {
      console.error('Erro ao carregar paciente:', err);
      Alert.alert('Erro', 'Não foi possível carregar os dados do paciente.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  // Recarregar dados frescos ao focar na tela
  useFocusEffect(
    useCallback(() => {
      if (patientId) loadPatient();
    }, [loadPatient, patientId])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="account-alert" size={64} color="#d1d5db" />
        <Text style={styles.emptyText}>Paciente não encontrado.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const quickActions = [
    {
      icon: 'clipboard-text',
      title: 'Anamnese',
      color: '#3b82f6',
      onPress: () => navigation.navigate('PatientAnamneses', { patient })
    },
    {
      icon: 'human-male-height',
      title: 'Medidas',
      color: '#8b5cf6',
      onPress: () => navigation.navigate('PatientMeasures', { patient })
    },
    {
      icon: 'food-apple',
      title: 'Dietas',
      color: '#10b981',
      onPress: () => navigation.navigate('MealPlans', { patientId: patient.id })
    },
    {
      icon: 'calendar-plus',
      title: 'Agendar',
      color: '#f59e0b',
      onPress: () => navigation.navigate('Schedule', { patientId: patient.id, patientName: patient.name })
    },
    {
      icon: 'flask',
      title: 'Exames',
      color: '#ef4444',
      onPress: () => navigation.navigate('PatientLabExams', { patient })
    },
    {
      icon: 'pill',
      title: 'Suplementos',
      color: '#f59e0b',
      onPress: () => navigation.navigate('PatientSupplements', { patient })
    },
    {
      icon: 'calculator',
      title: 'Gasto Energ.',
      color: '#f97316',
      onPress: () => navigation.navigate('PatientEnergy', { patient })
    },
    {
      icon: 'clock-outline',
      title: 'Recordatório',
      color: '#8b5cf6',
      onPress: () => navigation.navigate('PatientRecalls', { patient })
    },
    {
      icon: 'food-apple-outline',
      title: 'Diário Alimentar',
      color: '#ec4899',
      onPress: () => navigation.navigate('PatientFoodDiary', { patient })
    },
    {
      icon: 'chat',
      title: 'Chat',
      color: '#10b981',
      onPress: () => navigation.navigate('PatientChat', { patient })
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="account-circle" size={80} color="#10b981" />
        <Text style={styles.name}>{patient.name}</Text>
        <Text style={styles.email}>{patient.email || 'Sem e-mail cadastrado'}</Text>
        {patient.phone && (
          <Text style={styles.phone}>
            <MaterialCommunityIcons name="phone" size={14} /> {patient.phone}
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Dados Físicos Cadastrados</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Sexo:</Text>
          <Text style={styles.value}>
             {patient.sex === 'MALE' ? 'Masculino' : patient.sex === 'FEMALE' ? 'Feminino' : 'Não informado'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Nascimento:</Text>
          <Text style={styles.value}>
            {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('pt-BR') : 'Não informado'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Altura:</Text>
          <Text style={styles.value}>{patient.heightCm ? `${patient.heightCm} cm` : '---'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Peso:</Text>
          <Text style={styles.value}>{patient.weightKg ? `${patient.weightKg} kg` : '---'}</Text>
        </View>
        {patient.goal && (
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={styles.label}>Objetivo:</Text>
            <Text style={styles.value}>{patient.goal}</Text>
          </View>
        )}
      </View>

      <Text style={styles.quickActionsTitle}>Ações Rápidas</Text>
      <View style={styles.actionsGrid}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionButton}
            onPress={action.onPress}
          >
            <View style={[styles.iconCircle, { backgroundColor: action.color + '20' }]}>
              <MaterialCommunityIcons name={action.icon as any} size={28} color={action.color} />
            </View>
            <Text style={styles.actionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  backButton: {
    marginTop: 16,
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  email: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  phone: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  label: {
    fontSize: 15,
    color: '#6b7280',
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  }
});
