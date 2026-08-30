import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ACCOUNT_DELETION_URL, PRIVACY_POLICY_URL } from '../services/api';

export default function AppSettingsScreen() {
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="shield-account-outline" size={32} color="#047857" />
        </View>

        <Text style={styles.title}>Privacidade e conta</Text>
        <Text style={styles.description}>
          Consulte como seus dados são tratados e acesse as opções relacionadas à sua conta.
        </Text>

        <TouchableOpacity style={styles.legalButton} onPress={handleOpenPrivacyPolicy}>
          <View style={styles.buttonContent}>
            <MaterialCommunityIcons name="shield-lock-outline" size={22} color="#047857" />
            <View style={styles.buttonCopy}>
              <Text style={styles.legalButtonTitle}>Política de privacidade</Text>
              <Text style={styles.buttonDescription}>Veja como protegemos e utilizamos seus dados.</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#6b7280" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Exclusão da conta</Text>
        <Text style={styles.sectionDescription}>
          Você pode solicitar a exclusão da sua conta e dos dados vinculados a ela.
        </Text>

        <TouchableOpacity style={styles.dangerButton} onPress={handleOpenAccountDeletion}>
          <MaterialCommunityIcons name="account-remove-outline" size={21} color="#b91c1c" />
          <Text style={styles.dangerButtonText}>Solicitar exclusão de conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    flexGrow: 1,
    padding: 16,
  },
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
    backgroundColor: '#d1fae5',
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginBottom: 16,
    width: 64,
  },
  title: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  description: {
    color: '#6b7280',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
  },
  legalButton: {
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  buttonContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  buttonCopy: {
    flex: 1,
    marginLeft: 12,
  },
  legalButtonTitle: {
    color: '#047857',
    fontSize: 15,
    fontWeight: '800',
  },
  buttonDescription: {
    color: '#4b5563',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  divider: {
    backgroundColor: '#e5e7eb',
    height: 1,
    marginVertical: 24,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  sectionDescription: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  dangerButton: {
    alignItems: 'center',
    borderColor: '#fecaca',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 14,
  },
  dangerButtonText: {
    color: '#b91c1c',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
  },
});
