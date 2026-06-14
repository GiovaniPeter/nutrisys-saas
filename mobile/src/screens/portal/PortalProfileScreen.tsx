import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../services/api';

export default function PortalProfileScreen() {
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get('/portal/me');
        setPatient(response.data.patient);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('folder', 'avatars');

      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.success) {
        Alert.alert('Sucesso', 'Sua foto foi atualizada e enviada para a nuvem.');
      } else {
         Alert.alert('Aviso', 'A API respondeu, mas algo falhou no Storage.');
      }
    } catch (error) {
      console.error('Erro ao enviar foto:', error);
      Alert.alert('Erro de Integração', 'Para o upload funcionar, é necessário configurar as chaves do Supabase Storage no .env do backend.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#10b981" size="large" />
      </View>
    );
  }

  const age = patient?.birthDate ? calculateAge(patient.birthDate) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          <MaterialCommunityIcons name="account-circle" size={76} color="#10b981" />
          <View style={styles.cameraBadge}>
            <MaterialCommunityIcons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{patient?.name || 'Paciente'}</Text>
        <Text style={styles.clinic}>{patient?.organization?.name || 'Clínica NutreClin'}</Text>
      </View>

      <View style={styles.card}>
        <InfoRow icon="email-outline" label="E-mail" value={patient?.email || 'Não informado'} />
        <InfoRow icon="phone-outline" label="Telefone" value={patient?.phone || 'Não informado'} />
        <InfoRow icon="calendar-account" label="Idade" value={age ? `${age} anos` : 'Não informada'} />
        <InfoRow icon="human-male-height" label="Altura" value={patient?.heightCm ? `${patient.heightCm} cm` : 'Não informada'} />
        <InfoRow icon="scale-bathroom" label="Peso atual" value={patient?.weightKg ? `${patient.weightKg} kg` : 'Não informado'} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Objetivo principal</Text>
        <Text style={styles.goal}>{patient?.goal || 'Seu objetivo ainda não foi cadastrado pelo profissional.'}</Text>
      </View>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <MaterialCommunityIcons name={icon} size={24} color="#10b981" />
      <View style={styles.infoTextBox}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function calculateAge(value: string) {
  const birthDate = new Date(value);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f9fafb', flex: 1 },
  content: { padding: 16 },
  loadingContainer: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  headerCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 24,
  },
  name: { color: '#111827', fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  clinic: { color: '#6b7280', fontSize: 15, marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
  },
  infoRow: { alignItems: 'center', flexDirection: 'row', paddingVertical: 10 },
  infoTextBox: { flex: 1, marginLeft: 12 },
  infoLabel: { color: '#6b7280', fontSize: 13, fontWeight: '700' },
  infoValue: { color: '#111827', fontSize: 16, marginTop: 2 },
  sectionTitle: { color: '#374151', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  goal: { color: '#4b5563', fontSize: 16, lineHeight: 23 },
  avatarContainer: {
    position: 'relative',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  }
});
