import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, Modal, TextInput, Alert, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../services/api';

export default function PatientFoodDiaryScreen({ route }: any) {
  const { patient } = route.params || {};
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [savingFeedback, setSavingFeedback] = useState(false);

  const fetchDiary = useCallback(async (isRefresh = false) => {
    if (!patient) return;
    if (!isRefresh) setLoading(true);
    try {
      const response = await api.get(`/food-diary?patientId=${patient.id}`);
      setEntries(Array.isArray(response.data.entries) ? response.data.entries : []);
    } catch (error) {
      console.error('Erro ao buscar diário alimentar:', error);
      Alert.alert('Erro', 'Não foi possível carregar o diário alimentar.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [patient]);

  useEffect(() => {
    fetchDiary();
  }, [fetchDiary]);

  const openFeedback = (entry: any) => {
    setSelectedEntry(entry);
    setFeedbackNote(entry.feedbackNote || '');
  };

  const submitFeedback = async (status: 'APPROVED' | 'NEEDS_ADJUSTMENT' | 'PENDING') => {
    if (!selectedEntry) return;

    setSavingFeedback(true);
    try {
      const response = await api.patch(`/food-diary/${selectedEntry.id}`, {
        status,
        feedbackNote,
      });

      const updatedEntry = response.data.entry;
      setEntries((prev) => prev.map((entry) => entry.id === updatedEntry.id ? updatedEntry : entry));
      setSelectedEntry(null);
      setFeedbackNote('');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a avaliação.');
    } finally {
      setSavingFeedback(false);
    }
  };

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

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'APPROVED': return '#10b981';
      case 'NEEDS_ADJUSTMENT': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'APPROVED': return 'Aprovado';
      case 'NEEDS_ADJUSTMENT': return 'Pode Melhorar';
      default: return 'Pendente';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>Diário de {patient.name}</Text>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchDiary(true);
            }}
            colors={['#10b981']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="book-open-variant" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>O paciente ainda não registrou nenhuma refeição.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.titleRow}>
                <MaterialCommunityIcons name="food" size={20} color="#374151" />
                <Text style={styles.mealType}>{item.mealType}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {getStatusText(item.status)}
                </Text>
              </View>
            </View>

            <Text style={styles.dateTime}>
              {new Date(item.entryDate).toLocaleDateString()} {item.entryTime ? `às ${item.entryTime}` : ''}
            </Text>

            <Text style={styles.description}>{item.description}</Text>

            {item.photoUrl && (
              <Image source={{ uri: item.photoUrl }} style={styles.photo} resizeMode="cover" />
            )}

            {item.feedbackNote && (
              <View style={styles.feedbackBox}>
                <MaterialCommunityIcons name="comment-check-outline" size={18} color="#10b981" />
                <Text style={styles.feedbackText}>{item.feedbackNote}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.feedbackButton} onPress={() => openFeedback(item)}>
              <MaterialCommunityIcons name="comment-edit-outline" size={18} color="#fff" />
              <Text style={styles.feedbackButtonText}>Avaliar refeição</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={!!selectedEntry} transparent animationType="slide" onRequestClose={() => setSelectedEntry(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Avaliar diário</Text>
                <Text style={styles.modalSubtitle}>{selectedEntry?.mealType}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedEntry(null)}>
                <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>{selectedEntry?.description}</Text>

            <TextInput
              style={styles.feedbackInput}
              placeholder="Escreva um comentário para o paciente..."
              placeholderTextColor="#9ca3af"
              value={feedbackNote}
              onChangeText={setFeedbackNote}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.statusAction, styles.approveAction]}
                disabled={savingFeedback}
                onPress={() => submitFeedback('APPROVED')}
              >
                <MaterialCommunityIcons name="check" size={18} color="#fff" />
                <Text style={styles.statusActionText}>Aprovar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusAction, styles.adjustAction]}
                disabled={savingFeedback}
                onPress={() => submitFeedback('NEEDS_ADJUSTMENT')}
              >
                <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#fff" />
                <Text style={styles.statusActionText}>Ajustar</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.pendingButton}
              disabled={savingFeedback}
              onPress={() => submitFeedback('PENDING')}
            >
              {savingFeedback ? <ActivityIndicator color="#6b7280" /> : <Text style={styles.pendingButtonText}>Salvar como pendente</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  mealType: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginLeft: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  dateTime: { fontSize: 13, color: '#6b7280', marginBottom: 12 },
  description: { fontSize: 15, color: '#4b5563', lineHeight: 22 },
  photo: { width: '100%', height: 200, borderRadius: 8, marginTop: 12 },
  feedbackBox: { alignItems: 'flex-start', backgroundColor: '#ecfdf5', borderColor: '#bbf7d0', borderRadius: 10, borderWidth: 1, flexDirection: 'row', marginTop: 12, padding: 12 },
  feedbackText: { color: '#065f46', flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20, marginLeft: 8 },
  feedbackButton: { alignItems: 'center', backgroundColor: '#10b981', borderRadius: 8, flexDirection: 'row', justifyContent: 'center', marginTop: 14, padding: 12 },
  feedbackButtonText: { color: '#fff', fontSize: 14, fontWeight: '800', marginLeft: 8 },
  modalOverlay: { backgroundColor: 'rgba(17,24,39,0.45)', flex: 1, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 },
  modalHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  modalTitle: { color: '#111827', fontSize: 20, fontWeight: '900' },
  modalSubtitle: { color: '#6b7280', fontSize: 14, marginTop: 2 },
  modalDescription: { backgroundColor: '#f9fafb', borderColor: '#e5e7eb', borderRadius: 10, borderWidth: 1, color: '#374151', fontSize: 14, lineHeight: 20, marginBottom: 12, padding: 12 },
  feedbackInput: { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb', borderRadius: 10, borderWidth: 1, color: '#111827', fontSize: 15, height: 110, marginBottom: 14, padding: 12 },
  modalActions: { flexDirection: 'row', gap: 10 },
  statusAction: { alignItems: 'center', borderRadius: 10, flex: 1, flexDirection: 'row', justifyContent: 'center', padding: 13 },
  approveAction: { backgroundColor: '#10b981' },
  adjustAction: { backgroundColor: '#ef4444' },
  statusActionText: { color: '#fff', fontSize: 14, fontWeight: '900', marginLeft: 6 },
  pendingButton: { alignItems: 'center', borderColor: '#e5e7eb', borderRadius: 10, borderWidth: 1, marginTop: 10, padding: 13 },
  pendingButtonText: { color: '#6b7280', fontSize: 14, fontWeight: '800' }
});
