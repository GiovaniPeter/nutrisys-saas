import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Linking, TextInput, Modal } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfessionalMaterialsScreen() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Estado para o modal de novo material
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/materials');
      setMaterials(response.data.materials || []);
    } catch (error) {
      console.error('Erro ao buscar materiais:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus materiais.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMaterials();
    }, [fetchMaterials])
  );

  const handleSelectDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        if (!newTitle) {
          // Preenche o titulo com o nome do arquivo, sem a extensao
          setNewTitle(result.assets[0].name.replace('.pdf', ''));
        }
      }
    } catch (error) {
      console.error('Erro ao selecionar PDF:', error);
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo.');
    }
  };

  const handleUploadMaterial = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Aviso', 'Por favor, insira um título para o material.');
      return;
    }
    if (!selectedFile) {
      Alert.alert('Aviso', 'Por favor, selecione um arquivo PDF.');
      return;
    }

    setUploading(true);
    try {
      // 1. Obter URL pré-assinada
      const uploadReq = await api.post('/upload', {
        fileName: selectedFile.name,
        fileType: selectedFile.mimeType || 'application/pdf',
        bucket: 'nutriplan-uploads',
        folder: 'materials',
      });
      
      if (uploadReq.data?.presignedUrl) {
        // 2. Fazer o upload do arquivo para a URL pré-assinada
        const response = await fetch(selectedFile.uri);
        const blob = await response.blob();
        
        const putResponse = await fetch(uploadReq.data.presignedUrl, {
          method: 'PUT',
          body: blob,
          headers: {
            'Content-Type': selectedFile.mimeType || 'application/pdf',
          }
        });
        
        if (putResponse.ok) {
          // 3. Cadastrar o material no banco de dados
          await api.post('/materials', {
            title: newTitle,
            designUrl: uploadReq.data.publicUrl,
            audience: 'ALL',
            category: 'PDF',
            tags: [],
          });
          
          Alert.alert('Sucesso', 'Material enviado e cadastrado com sucesso!');
          setModalVisible(false);
          setNewTitle('');
          setSelectedFile(null);
          fetchMaterials();
        } else {
          throw new Error('Falha no upload para o storage');
        }
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      Alert.alert('Erro', 'Não foi possível enviar o material. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Excluir Material',
      'Tem certeza que deseja remover este material? Os pacientes perderão o acesso a ele.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/materials/${id}`);
              fetchMaterials();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o material.');
            }
          }
        }
      ]
    );
  };

  const openMaterial = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Erro', 'Não foi possível abrir este material.');
      });
    }
  };

  if (loading && materials.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Carregando materiais...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={materials}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="file-document-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Nenhum material cadastrado.</Text>
            <Text style={styles.emptySubtext}>Faça o upload de cartilhas e guias em PDF para seus pacientes.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <MaterialCommunityIcons name="file-pdf-box" size={40} color="#ef4444" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.materialTitle}>{item.title}</Text>
              <Text style={styles.materialDate}>Enviado em {new Date(item.createdAt).toLocaleDateString('pt-BR')}</Text>
              
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openMaterial(item.designUrl)}>
                  <MaterialCommunityIcons name="open-in-new" size={16} color="#3b82f6" />
                  <Text style={[styles.actionBtnText, { color: '#3b82f6' }]}>Visualizar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
                  <MaterialCommunityIcons name="trash-can-outline" size={16} color="#ef4444" />
                  <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Modal de Novo Material */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !uploading && setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Material</Text>
              <TouchableOpacity onPress={() => !uploading && setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Título do material</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Cartilha de Emagrecimento"
              value={newTitle}
              onChangeText={setNewTitle}
              editable={!uploading}
            />

            <Text style={styles.label}>Arquivo PDF</Text>
            {selectedFile ? (
              <View style={styles.fileSelectedBox}>
                <MaterialCommunityIcons name="file-pdf-box" size={32} color="#ef4444" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                  <Text style={styles.fileSize}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</Text>
                </View>
                {!uploading && (
                  <TouchableOpacity onPress={() => setSelectedFile(null)}>
                    <MaterialCommunityIcons name="close-circle" size={24} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <TouchableOpacity style={styles.selectFileBtn} onPress={handleSelectDocument} disabled={uploading}>
                <MaterialCommunityIcons name="upload" size={24} color="#10b981" />
                <Text style={styles.selectFileText}>Selecionar PDF do Celular</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.saveBtn, (!selectedFile || !newTitle || uploading) && styles.saveBtnDisabled]} 
              onPress={handleUploadMaterial}
              disabled={!selectedFile || !newTitle || uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Enviar Material</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  materialDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#10b981',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    marginBottom: 16,
  },
  selectFileBtn: {
    flexDirection: 'row',
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#10b981',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  selectFileText: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 12,
  },
  fileSelectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  fileName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  fileSize: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  saveBtn: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
