import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../services/api';

export default function PatientAnamnesesScreen({ route }: any) {
  const { patient } = route.params;
  const [anamneses, setAnamneses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnamneses() {
      try {
        const response = await api.get(`/anamneses?patientId=${patient.id}`);
        const data = Array.isArray(response.data) ? response.data : response.data.anamneses || [];
        setAnamneses(data);
      } catch (error) {
        console.error('Erro ao buscar anamneses:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnamneses();
  }, [patient.id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={anamneses}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-text-off" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>Nenhuma anamnese registrada para este paciente.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="clipboard-text" size={24} color="#3b82f6" />
              <Text style={styles.cardTitle}>{item.type || 'Anamnese Geral'}</Text>
            </View>
            <Text style={styles.date}>Respondida em: {new Date(item.createdAt).toLocaleDateString()}</Text>

            {/* Conta quantas chaves têm no objeto de respostas pra dar um resumo */}
            <Text style={styles.summary}>
               {item.answers ? Object.keys(item.answers).length : 0} perguntas respondidas
            </Text>
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
  emptyContainer: {
    alignItems: 'center',
    marginTop: 64,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#6b7280',
    fontSize: 16,
    maxWidth: '80%',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  summary: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  }
});
