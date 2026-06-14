import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ACCOUNT_DELETION_URL,
  ANDROID_EMULATOR_API_BASE_URL,
  api,
  DEFAULT_API_BASE_URL,
  LAN_API_BASE_URL,
  LOCALHOST_API_BASE_URL,
  PRIVACY_POLICY_URL,
  PRODUCTION_API_BASE_URL,
  getApiBaseUrl,
  setApiBaseUrl,
} from '../services/api';

export default function AppSettingsScreen() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_API_BASE_URL);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    getApiBaseUrl().then(setBaseUrl);
  }, []);

  const handleSave = async () => {
    if (!baseUrl.startsWith('http')) {
      Alert.alert('URL inválida', 'Informe uma URL começando com http:// ou https://');
      return;
    }

    setSaving(true);
    try {
      await setApiBaseUrl(baseUrl);
      Alert.alert('Conexão atualizada', 'O app usará este endereço nas próximas chamadas.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a URL da API.');
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (url: string) => {
    setBaseUrl(url);
  };

  const handleOpenAccountDeletion = async () => {
    try {
      await Linking.openURL(ACCOUNT_DELETION_URL);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir a página de exclusão de conta.');
    }
  };

  const handleOpenPrivacyPolicy = async () => {
    try {
      await Linking.openURL(PRIVACY_POLICY_URL);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir a política de privacidade.');
    }
  };

  const handleTestConnection = async () => {
    if (!baseUrl.startsWith('http')) {
      Alert.alert('URL inválida', 'Informe uma URL começando com http:// ou https://');
      return;
    }

    setTesting(true);
    try {
      await setApiBaseUrl(baseUrl);
      const response = await api.get('/health', { timeout: 12000 });
      if (response.data?.database === 'ok') {
        Alert.alert('Conexão OK', 'A API e o banco de dados responderam corretamente.');
      } else {
        Alert.alert('API respondeu, banco falhou', JSON.stringify(response.data));
      }
    } catch (error: any) {
      const status = error.response?.status;
      const data = error.response?.data;
      const message = data?.error || data?.message || error.message || 'Não foi possível acessar a API.';
      Alert.alert(status ? `Erro ${status}` : 'Erro de conexão', typeof data === 'object' ? JSON.stringify(data) : message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="server-network" size={32} color="#10b981" />
        </View>
        <Text style={styles.title}>Conexão com o servidor</Text>
        <Text style={styles.description}>
          O app usa o servidor online por padrão. Para testes locais, informe o IP Wi-Fi deste computador ou use 10.0.2.2 no emulador Android.
        </Text>

        <Text style={styles.label}>URL da API</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="url"
          onChangeText={setBaseUrl}
          placeholder="https://nutrisys-pro.vercel.app/api"
          placeholderTextColor="#9ca3af"
          style={styles.input}
          value={baseUrl}
        />

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? 'Salvando...' : 'Salvar conexão'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={handleTestConnection} disabled={testing}>
          {testing ? (
            <ActivityIndicator color="#047857" />
          ) : (
            <Text style={styles.testButtonText}>Testar conexão</Text>
          )}
        </TouchableOpacity>

        <View style={styles.presetGrid}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => applyPreset(DEFAULT_API_BASE_URL)}>
            <Text style={styles.secondaryButtonText}>Padrão</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => applyPreset(PRODUCTION_API_BASE_URL)}>
            <Text style={styles.secondaryButtonText}>Produção</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => applyPreset(LAN_API_BASE_URL)}>
            <Text style={styles.secondaryButtonText}>IP Wi-Fi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => applyPreset(ANDROID_EMULATOR_API_BASE_URL)}>
            <Text style={styles.secondaryButtonText}>Emulador</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => applyPreset(LOCALHOST_API_BASE_URL)}>
            <Text style={styles.secondaryButtonText}>Localhost</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.dangerLinkButton} onPress={handleOpenAccountDeletion}>
          <MaterialCommunityIcons name="account-remove-outline" size={20} color="#b91c1c" />
          <Text style={styles.dangerLinkText}>Solicitar exclusão de conta</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.legalLinkButton} onPress={handleOpenPrivacyPolicy}>
          <MaterialCommunityIcons name="shield-lock-outline" size={20} color="#047857" />
          <Text style={styles.legalLinkText}>Política de privacidade</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f9fafb', flex: 1, padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 2,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginBottom: 16,
    width: 64,
  },
  title: { color: '#111827', fontSize: 21, fontWeight: 'bold', marginBottom: 8 },
  description: { color: '#6b7280', fontSize: 15, lineHeight: 22, marginBottom: 20 },
  label: { color: '#374151', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  input: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 10,
    borderWidth: 1,
    color: '#111827',
    fontSize: 15,
    marginBottom: 14,
    padding: 14,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#10b981',
    borderRadius: 10,
    padding: 14,
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  testButton: {
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
    padding: 14,
  },
  testButtonText: { color: '#047857', fontSize: 15, fontWeight: 'bold' },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  secondaryButtonText: { color: '#047857', fontSize: 14, fontWeight: '700' },
  dangerLinkButton: {
    alignItems: 'center',
    borderColor: '#fecaca',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
    padding: 13,
  },
  dangerLinkText: { color: '#b91c1c', fontSize: 14, fontWeight: '800', marginLeft: 8 },
  legalLinkButton: {
    alignItems: 'center',
    borderColor: '#a7f3d0',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    padding: 13,
  },
  legalLinkText: { color: '#047857', fontSize: 14, fontWeight: '800', marginLeft: 8 },
});
