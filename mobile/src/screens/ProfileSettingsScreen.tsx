import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image, Share } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileSettingsScreen() {
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Campos de edição
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/settings/organization');
      const org = response.data.organization;
      if (org) {
        setOrganization(org);
        setName(org.name || '');
        setDocument(org.document || '');
        setPhone(org.phone || '');
        setAddress(org.address || '');
        setLogoUrl(org.logoUrl || '');
      }
    } catch (error) {
      console.error('Erro ao carregar configuracoes:', error);
      Alert.alert('Erro', 'Não foi possível carregar as configurações do perfil.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSettings();
    }, [fetchSettings])
  );

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Aviso', 'O nome da clínica é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      await api.patch('/settings/organization', {
        name,
        document,
        phone,
        address,
        logoUrl,
      });
      Alert.alert('Sucesso', 'Configurações salvas com sucesso.');
      fetchSettings();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar as configurações.');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para alterar a foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
    setUploading(true);
    try {
      const fileName = asset.fileName || asset.uri.split('/').pop() || 'logo.jpg';
      
      // 1. Obter URL pré-assinada
      const uploadReq = await api.post('/upload', {
        fileName,
        fileType: asset.mimeType || 'image/jpeg',
        bucket: 'nutriplan-uploads',
        folder: 'logos',
      });
      
      if (uploadReq.data?.presignedUrl) {
        // 2. Fazer o upload do arquivo para a URL pré-assinada
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        
        const putResponse = await fetch(uploadReq.data.presignedUrl, {
          method: 'PUT',
          body: blob,
          headers: {
            'Content-Type': asset.mimeType || 'image/jpeg',
          }
        });
        
        if (putResponse.ok) {
          // Atualiza a URL local e avisa para salvar
          setLogoUrl(uploadReq.data.publicUrl);
          Alert.alert('Imagem carregada', 'A imagem foi carregada com sucesso. Toque em "Salvar Configurações" para confirmar.');
        } else {
          throw new Error('Falha no upload para o storage');
        }
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      Alert.alert('Erro de Upload', 'Não foi possível enviar a imagem para o servidor.');
    } finally {
      setUploading(false);
    }
  };

  const shareBookingLink = async () => {
    if (!organization?.slug) return;
    const url = `https://nutrisys-pro-rho.vercel.app/book/${organization.slug}`;
    try {
      await Share.share({
        message: `Agende sua consulta online através do nosso link:\n${url}`,
        url, // Para iOS
        title: 'Link de Agendamento',
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Identidade Visual</Text>
        <View style={styles.logoContainer}>
          {uploading ? (
            <View style={[styles.logoPreview, styles.logoLoading]}>
              <ActivityIndicator color="#10b981" />
            </View>
          ) : logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.logoPreview} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <MaterialCommunityIcons name="storefront" size={40} color="#9ca3af" />
            </View>
          )}
          
          <TouchableOpacity style={styles.uploadButton} onPress={handleSelectImage} disabled={uploading}>
            <MaterialCommunityIcons name="camera" size={20} color="#fff" />
            <Text style={styles.uploadButtonText}>Alterar Logotipo</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Dados da Clínica</Text>
        
        <Text style={styles.label}>Nome da Clínica *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ex: Consultório Dra. Maria"
        />

        <Text style={styles.label}>Documento (CPF/CNPJ)</Text>
        <TextInput
          style={styles.input}
          value={document}
          onChangeText={setDocument}
          placeholder="Opcional"
        />

        <Text style={styles.label}>Telefone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="(00) 00000-0000"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Endereço Completo</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={address}
          onChangeText={setAddress}
          placeholder="Rua, Número, Bairro, Cidade..."
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.buttonDisabled]} 
          onPress={handleSave} 
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar Configurações</Text>
          )}
        </TouchableOpacity>
      </View>

      {organization?.slug && (
        <View style={styles.card}>
          <View style={styles.linkHeader}>
            <MaterialCommunityIcons name="calendar-link" size={24} color="#10b981" />
            <Text style={styles.sectionTitleLink}>Link Público de Agendamento</Text>
          </View>
          <Text style={styles.descriptionText}>
            Seus pacientes podem usar este link para marcar consultas automaticamente, sem precisar de cadastro prévio.
          </Text>
          <View style={styles.linkBox}>
            <Text style={styles.linkText} numberOfLines={1}>
              https://nutrisys-pro-rho.vercel.app/book/{organization.slug}
            </Text>
          </View>
          <TouchableOpacity style={styles.shareButton} onPress={shareBookingLink}>
            <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
            <Text style={styles.shareButtonText}>Compartilhar Link</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  logoLoading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
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
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Link section
  linkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitleLink: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  linkBox: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  linkText: {
    color: '#047857',
    fontWeight: '500',
    fontSize: 14,
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 15,
  }
});
