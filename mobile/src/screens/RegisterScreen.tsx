import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PRIVACY_POLICY_URL, api, getApiBaseUrl } from '../services/api';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [planCode, setPlanCode] = useState<'essential' | 'professional' | 'clinic'>('professional');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !organizationName.trim() || !email.trim() || !password) {
      Alert.alert('Cadastro incompleto', 'Preencha nome, clínica, e-mail e senha.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Senha fraca', 'A senha precisa ter pelo menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: name.trim(),
        organizationName: organizationName.trim(),
        email: email.trim().toLowerCase(),
        password,
        planCode,
      });

      const loginResponse = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
        accessMode: 'nutritionist',
      });

      const { token, user } = loginResponse.data;

      if (!token || !user) {
        Alert.alert('Cadastro criado', 'Sua conta foi criada. Faça login para continuar.');
        navigation.replace('Login');
        return;
      }

      await AsyncStorage.setItem('@NutriPlan:token', token);
      await AsyncStorage.setItem('@NutriPlan:user', JSON.stringify(user));
      await AsyncStorage.setItem('@NutriPlan:role', 'PROFESSIONAL');

      Alert.alert('Conta criada', 'Seu trial foi iniciado.', [
        { text: 'OK', onPress: () => navigation.replace('HomeTabs') },
      ]);
    } catch (error: any) {
      const status = error.response?.status;
      const data = error.response?.data;
      const message = data?.error || data?.message || error.message || 'Não foi possível criar a conta.';
      if (!status) {
        const currentApiBaseUrl = await getApiBaseUrl();
        Alert.alert(
          'Erro de conexão',
          `Não foi possível acessar ${currentApiBaseUrl}. Volte ao login, abra "Configurar conexão do app" e use "Testar conexão".`
        );
        return;
      }

      Alert.alert(`Erro no cadastro (${status})`, message);
    } finally {
      setLoading(false);
    }
  };

  const handleLocalRegister = async () => {
    if (!name.trim() || !organizationName.trim() || !email.trim()) {
      Alert.alert('Cadastro local incompleto', 'Preencha nome, clínica e e-mail para criar o acesso de teste.');
      return;
    }

    const user = {
      id: `local-${Date.now()}`,
      organizationId: 'local-demo',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'OWNER',
      organization: {
        name: organizationName.trim(),
      },
    };

    await AsyncStorage.setItem('@NutriPlan:token', `local-demo-${Date.now()}`);
    await AsyncStorage.setItem('@NutriPlan:user', JSON.stringify(user));
    await AsyncStorage.setItem('@NutriPlan:role', 'PROFESSIONAL');
    await AsyncStorage.setItem('@NutriPlan:localMode', 'true');

    Alert.alert('Modo teste ativado', 'Você entrou com uma conta local. Os dados reais dependem do banco Supabase.', [
      { text: 'OK', onPress: () => navigation.replace('HomeTabs') },
    ]);
  };

  const handleOpenPrivacyPolicy = async () => {
    try {
      await Linking.openURL(PRIVACY_POLICY_URL);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir a política de privacidade.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#047857" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Cadastre sua clínica e comece o trial do NutreClin.</Text>

        <TextInput
          autoCapitalize="words"
          onChangeText={setName}
          placeholder="Seu nome completo"
          placeholderTextColor="#9ca3af"
          style={styles.input}
          value={name}
        />

        <TextInput
          autoCapitalize="words"
          onChangeText={setOrganizationName}
          placeholder="Nome da clínica"
          placeholderTextColor="#9ca3af"
          style={styles.input}
          value={organizationName}
        />

        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="E-mail profissional"
          placeholderTextColor="#9ca3af"
          style={styles.input}
          value={email}
        />

        <View style={styles.passwordField}>
          <TextInput
            onChangeText={setPassword}
            placeholder="Senha com 8 caracteres ou mais"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
            value={password}
          />
          <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword((value) => !value)}>
            <MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Plano inicial</Text>
        <View style={styles.planRow}>
          <PlanButton label="Essencial" active={planCode === 'essential'} onPress={() => setPlanCode('essential')} />
          <PlanButton label="Profissional" active={planCode === 'professional'} onPress={() => setPlanCode('professional')} />
          <PlanButton label="Clínica" active={planCode === 'clinic'} onPress={() => setPlanCode('clinic')} />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Criar conta</Text>}
        </TouchableOpacity>

        <Text style={styles.privacyNote}>
          Ao criar conta, você concorda com o tratamento dos dados conforme a{' '}
          <Text style={styles.privacyLink} onPress={handleOpenPrivacyPolicy}>Política de privacidade</Text>.
        </Text>

        <TouchableOpacity style={styles.localButton} onPress={handleLocalRegister}>
          <Text style={styles.localButtonText}>Entrar em modo teste local</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.replace('Login')}>
          <Text style={styles.loginText}>Já tenho conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PlanButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.planButton, active && styles.planButtonActive]} onPress={onPress}>
      <Text style={[styles.planText, active && styles.planTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f3f4f6', flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  backButton: { alignItems: 'center', flexDirection: 'row', marginBottom: 18 },
  backText: { color: '#047857', fontSize: 15, fontWeight: '700', marginLeft: 6 },
  title: { color: '#111827', fontSize: 30, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: '#6b7280', fontSize: 15, lineHeight: 22, marginBottom: 24 },
  input: {
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 14,
    padding: 16,
  },
  passwordField: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 18,
  },
  passwordInput: { flex: 1, fontSize: 16, padding: 16 },
  eyeButton: { paddingHorizontal: 14, paddingVertical: 12 },
  sectionLabel: { color: '#374151', fontSize: 14, fontWeight: '800', marginBottom: 10 },
  planRow: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  planButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  planButtonActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
  planText: { color: '#6b7280', fontSize: 12, fontWeight: '800' },
  planTextActive: { color: '#fff' },
  button: { alignItems: 'center', backgroundColor: '#10b981', borderRadius: 8, padding: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  privacyNote: {
    color: '#6b7280',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
    textAlign: 'center',
  },
  privacyLink: {
    color: '#047857',
    fontWeight: '900',
  },
  localButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#d1fae5',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 14,
  },
  localButtonText: { color: '#047857', fontSize: 14, fontWeight: '800' },
  loginButton: { alignItems: 'center', marginTop: 16, padding: 10 },
  loginText: { color: '#047857', fontSize: 14, fontWeight: '700' },
});
