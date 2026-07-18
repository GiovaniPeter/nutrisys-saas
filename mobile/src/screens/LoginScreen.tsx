import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PASSWORD_RECOVERY_URL, PRIVACY_POLICY_URL, api, getApiBaseUrl } from '../services/api';

export default function LoginScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'PROFESSIONAL' | 'PATIENT'>('PROFESSIONAL');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Patient fields
  const [identifier, setIdentifier] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [showAccessCode, setShowAccessCode] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (activeTab === 'PROFESSIONAL') {
        if (!email || !password) {
          Alert.alert('Erro', 'Preencha e-mail e senha.');
          setLoading(false);
          return;
        }

        const response = await api.post('/auth/login', { email, password });
        const { token, user } = response.data;

        if (token) {
          await AsyncStorage.setItem('@NutriPlan:token', token);
          await AsyncStorage.setItem('@NutriPlan:user', JSON.stringify(user));
          await AsyncStorage.setItem('@NutriPlan:role', 'PROFESSIONAL');
          navigation.replace('HomeTabs');
        } else {
          Alert.alert('Erro', 'Token de acesso não recebido.');
        }

      } else {
        if (!identifier || !accessCode) {
          Alert.alert('Erro', 'Preencha e-mail ou telefone e o código de acesso.');
          setLoading(false);
          return;
        }

        const response = await api.post('/portal/login', { identifier, accessCode });
        const { token, patient } = response.data;

        if (token) {
          await AsyncStorage.setItem('@NutriPlan:token', token);
          await AsyncStorage.setItem('@NutriPlan:user', JSON.stringify(patient));
          await AsyncStorage.setItem('@NutriPlan:role', 'PATIENT');
          navigation.replace('PortalTabs');
        } else {
          Alert.alert('Erro', 'Token de acesso não recebido.');
        }
      }
    } catch (error: any) {
       const status = error.response?.status;
       const data = error.response?.data;
       const msg = data?.error || data?.message || error.message || 'Erro ao realizar login.';
       if (!status) {
         const currentApiBaseUrl = await getApiBaseUrl();
         Alert.alert(
           'Erro de conexão',
           `Não foi possível acessar ${currentApiBaseUrl}. Abra "Configurar conexão do app" e use "Testar conexão".`
         );
         return;
       }

       Alert.alert(`Acesso negado (${status})`, msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLocalLogin = async () => {
    const user = {
      id: 'local-demo',
      organizationId: 'local-demo',
      name: email.trim() ? email.trim().split('@')[0] : 'Profissional teste',
      email: email.trim().toLowerCase() || 'teste@nutriplan.local',
      role: 'OWNER',
    };

    await AsyncStorage.setItem('@NutriPlan:token', `local-demo-${Date.now()}`);
    await AsyncStorage.setItem('@NutriPlan:user', JSON.stringify(user));
    await AsyncStorage.setItem('@NutriPlan:role', 'PROFESSIONAL');
    await AsyncStorage.setItem('@NutriPlan:localMode', 'true');
    navigation.replace('HomeTabs');
  };

  const handleOpenPasswordRecovery = async () => {
    try {
      await Linking.openURL(PASSWORD_RECOVERY_URL);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir a página de recuperação de acesso.');
    }
  };

  const handleOpenPrivacyPolicy = async () => {
    try {
      await Linking.openURL(PRIVACY_POLICY_URL);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir a política de privacidade.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>ClinOS</Text>
        <Text style={styles.subtitle}>Acesso ao Sistema</Text>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'PROFESSIONAL' && styles.tabButtonActive]}
            onPress={() => setActiveTab('PROFESSIONAL')}
          >
            <Text style={[styles.tabText, activeTab === 'PROFESSIONAL' && styles.tabTextActive]}>Profissional</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'PATIENT' && styles.tabButtonActive]}
            onPress={() => setActiveTab('PATIENT')}
          >
            <Text style={[styles.tabText, activeTab === 'PATIENT' && styles.tabTextActive]}>Paciente</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'PROFESSIONAL' ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Seu E-mail"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.passwordField}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Sua Senha"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword((value) => !value)}>
                <MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.forgotPasswordButton} onPress={handleOpenPasswordRecovery}>
              <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="E-mail ou Telefone"
              placeholderTextColor="#9ca3af"
              value={identifier}
              onChangeText={setIdentifier}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.passwordField}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Código de Acesso"
                placeholderTextColor="#9ca3af"
                value={accessCode}
                onChangeText={setAccessCode}
                secureTextEntry={!showAccessCode}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowAccessCode((value) => !value)}>
                <MaterialCommunityIcons name={showAccessCode ? 'eye-off' : 'eye'} size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.forgotPasswordButton} onPress={handleOpenPasswordRecovery}>
              <Text style={styles.forgotPasswordText}>Esqueci meu código de acesso</Text>
            </TouchableOpacity>
            <Text style={styles.patientHint}>
              Pacientes entram com o código liberado pelo nutricionista.
            </Text>
          </>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        {activeTab === 'PROFESSIONAL' ? (
          <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>Criar conta profissional</Text>
          </TouchableOpacity>
        ) : null}

        {activeTab === 'PROFESSIONAL' ? (
          <TouchableOpacity style={styles.localButton} onPress={handleLocalLogin}>
            <Text style={styles.localText}>Entrar em modo teste local</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('AppSettings')}>
          <Text style={styles.settingsText}>Configurar conexão do app</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.privacyButton} onPress={handleOpenPrivacyPolicy}>
          <Text style={styles.privacyText}>Política de privacidade</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  passwordField: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    padding: 16,
  },
  eyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  patientHint: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
    marginTop: 4,
  },
  forgotPasswordButton: {
    alignItems: 'flex-end',
    marginBottom: 10,
    marginTop: -8,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    color: '#047857',
    fontSize: 14,
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 14,
  },
  registerText: {
    color: '#047857',
    fontSize: 15,
    fontWeight: 'bold',
  },
  localButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#d1fae5',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 13,
  },
  localText: {
    color: '#047857',
    fontSize: 14,
    fontWeight: '800',
  },
  settingsButton: {
    alignItems: 'center',
    marginTop: 18,
    padding: 8,
  },
  settingsText: {
    color: '#047857',
    fontSize: 14,
    fontWeight: '700',
  },
  privacyButton: {
    alignItems: 'center',
    padding: 8,
  },
  privacyText: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '700',
  },
});
