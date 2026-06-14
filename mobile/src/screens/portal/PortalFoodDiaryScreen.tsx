import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../services/api';
import { notifyFoodDiaryFeedback } from '../../services/notifications';

export default function PortalFoodDiaryScreen() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [mealType, setMealType] = useState('Almoço');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await api.get('/portal/food-diary');
      const data = response.data.entries || [];
      setEntries(data);
      notifyFoodDiaryFeedback(data).catch(() => undefined);
    } catch (error) {
      console.error('Erro ao buscar diário alimentar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!description.trim()) {
      Alert.alert('Erro', 'Por favor, descreva a refeição.');
      return;
    }
    setSubmitting(true);
    try {
      const uploadedPhotoUrl = photoUri ? await uploadSelectedPhoto(photoUri) : '';

      await api.post('/portal/food-diary', {
        mealType,
        description,
        entryDate: new Date().toISOString(), // Enviando data atual
        photoUrl: uploadedPhotoUrl,
      });
      setDescription('');
      setPhotoUri(null);
      fetchEntries();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar a refeição.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickPhoto = async (source: 'camera' | 'library') => {
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permissão necessária', 'Autorize a câmera para fotografar a refeição.');
          return;
        }
      }

      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.75,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.75,
          });

      if (!result.canceled && result.assets[0]?.uri) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a foto.');
    }
  };

  const uploadSelectedPhoto = async (uri: string) => {
    const fileName = uri.split('/').pop() || `refeicao-${Date.now()}.jpg`;
    const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';

    const formData = new FormData();
    formData.append('file', {
      uri,
      name: fileName,
      type: mimeType,
    } as any);
    formData.append('folder', 'food-diary');

    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 20000,
    });

    return response.data.url || '';
  };

  const getStatusColor = (status: string) => {
    if (status === 'APPROVED') return '#10b981';
    if (status === 'NEEDS_ADJUSTMENT') return '#ef4444';
    return '#f59e0b';
  };

  const getStatusText = (status: string) => {
    if (status === 'APPROVED') return 'Aprovado';
    if (status === 'NEEDS_ADJUSTMENT') return 'Ajustar';
    return 'Aguardando avaliação';
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.mealType}>{item.mealType}</Text>
        <Text style={styles.dateText}>
          {new Date(item.entryDate).toLocaleDateString()} {item.entryTime && `- ${item.entryTime}`}
        </Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusText(item.status)}</Text>
      </View>
      <Text style={styles.description}>{item.description}</Text>
      {item.photoUrl && <Image source={{ uri: item.photoUrl }} style={styles.entryPhoto} resizeMode="cover" />}
      {item.feedbackNote && (
        <View style={styles.feedbackBox}>
          <MaterialCommunityIcons name="comment-check-outline" size={18} color="#10b981" />
          <Text style={styles.feedbackText}>{item.feedbackNote}</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.addForm}>
        <Text style={styles.formTitle}>Registrar Refeição</Text>
        <TextInput
          style={styles.input}
          placeholder="Qual foi a refeição? (Ex: Café da Manhã)"
          value={mealType}
          onChangeText={setMealType}
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="O que você comeu?"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        {photoUri ? (
          <View style={styles.previewBox}>
            <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="cover" />
            <TouchableOpacity style={styles.removePhotoButton} onPress={() => setPhotoUri(null)}>
              <MaterialCommunityIcons name="close" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.photoButton} onPress={() => handlePickPhoto('camera')}>
              <MaterialCommunityIcons name="camera" size={20} color="#f59e0b" />
              <Text style={styles.photoButtonText}>Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={() => handlePickPhoto('library')}>
              <MaterialCommunityIcons name="image" size={20} color="#f59e0b" />
              <Text style={styles.photoButtonText}>Galeria</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleAdd} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Adicionar refeição</Text>}
        </TouchableOpacity>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>Você ainda não registrou nenhuma refeição.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  addForm: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  input: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  photoActions: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  photoButton: { alignItems: 'center', backgroundColor: '#fffbeb', borderColor: '#fde68a', borderRadius: 8, borderWidth: 1, flex: 1, flexDirection: 'row', justifyContent: 'center', padding: 12 },
  photoButtonText: { color: '#b45309', fontSize: 14, fontWeight: '800', marginLeft: 6 },
  previewBox: { marginBottom: 12, position: 'relative' },
  previewImage: { width: '100%', height: 180, borderRadius: 10 },
  removePhotoButton: { alignItems: 'center', backgroundColor: '#111827', borderRadius: 16, height: 32, justifyContent: 'center', position: 'absolute', right: 8, top: 8, width: 32 },
  button: { backgroundColor: '#f59e0b', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width:0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  mealType: { fontSize: 16, fontWeight: 'bold', color: '#f59e0b' },
  dateText: { fontSize: 14, color: '#6b7280' },
  statusBadge: { alignSelf: 'flex-start', borderRadius: 999, marginBottom: 10, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '900' },
  description: { fontSize: 16, color: '#374151' },
  entryPhoto: { width: '100%', height: 190, borderRadius: 10, marginTop: 12 },
  feedbackBox: { alignItems: 'flex-start', backgroundColor: '#ecfdf5', borderColor: '#bbf7d0', borderRadius: 10, borderWidth: 1, flexDirection: 'row', marginTop: 12, padding: 12 },
  feedbackText: { color: '#065f46', flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20, marginLeft: 8 },
  emptyText: { textAlign: 'center', marginTop: 32, fontSize: 16, color: '#9ca3af' }
});
