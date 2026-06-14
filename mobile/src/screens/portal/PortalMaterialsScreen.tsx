import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Linking, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../../services/api';

export default function PortalMaterialsScreen() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMaterials() {
      try {
        const response = await api.get('/portal/materials');
        setMaterials(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Erro ao buscar materiais:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMaterials();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  const handleOpenLink = async (url: string) => {
    if (!url) {
      Alert.alert("Erro", "Link não disponível.");
      return;
    }
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Erro", "Não foi possível abrir este link: " + url);
    }
  };

  const getIconForType = (type: string) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('pdf')) return 'file-pdf-box';
    if (t.includes('video') || t.includes('vídeo') || t.includes('youtube')) return 'video';
    if (t.includes('image') || t.includes('foto')) return 'image';
    return 'file-document';
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={materials}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="folder-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>Nenhum material educativo disponível.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleOpenLink(item.fileUrl || item.linkUrl)}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name={getIconForType(item.type || item.category)} size={32} color="#3b82f6" />
            </View>
            <View style={styles.textContent}>
              <Text style={styles.title}>{item.title}</Text>
              {item.category && <Text style={styles.category}>{item.category}</Text>}
              {item.description && <Text style={styles.description} numberOfLines={2}>{item.description}</Text>}
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
          </TouchableOpacity>
        )}
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
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: { width: 48, alignItems: 'center', justifyContent: 'center' },
  textContent: { flex: 1, marginLeft: 12, marginRight: 8 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  category: { fontSize: 12, color: '#3b82f6', marginTop: 2, fontWeight: '600' },
  description: { fontSize: 13, color: '#6b7280', marginTop: 4 }
});