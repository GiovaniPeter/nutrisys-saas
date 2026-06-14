import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ACCOUNT_DELETION_URL } from '../services/api';

export default function MenuScreen({ navigation }: any) {

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@NutriPlan:token');
    await AsyncStorage.removeItem('@NutriPlan:user');
    await AsyncStorage.removeItem('@NutriPlan:role');
    navigation.replace('Login');
  };

  const confirmLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: handleLogout },
      ]
    );
  };

  const handleOpenAccountDeletion = async () => {
    try {
      await Linking.openURL(ACCOUNT_DELETION_URL);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir a página de exclusão de conta.');
    }
  };

  const menuItems = [
    { icon: 'food-apple', title: 'Alimentos', route: 'Foods' },
    { icon: 'clipboard-text', title: 'Anamneses', route: 'PatientAnamneses', needsPatient: true },
    { icon: 'human-male-height', title: 'Antropometria', route: 'PatientMeasures', needsPatient: true },
    { icon: 'flask', title: 'Exames Lab.', route: 'PatientLabExams', needsPatient: true },
    { icon: 'pill', title: 'Suplementos', route: 'PatientSupplements', needsPatient: true },
    { icon: 'silverware-fork-knife', title: 'Receitas', route: 'Recipes' },
    { icon: 'chat-processing', title: 'Chat', route: 'PatientChat', needsPatient: true },
    { icon: 'currency-usd', title: 'Financeiro', route: 'Financial' },
    { icon: 'cog-outline', title: 'Config. App', route: 'AppSettings' },
  ];

  const handleMenuPress = (item: typeof menuItems[0]) => {
    if (item.needsPatient) {
      // Telas que dependem de paciente: navegar primeiro para lista de pacientes
      Alert.alert(
        item.title,
        'Selecione um paciente na lista de Pacientes para acessar esta funcionalidade.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ir para Pacientes', onPress: () => navigation.navigate('PatientsTab') },
        ]
      );
    } else {
      navigation.navigate(item.route);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Mais Funcionalidades</Text>

      <View style={styles.grid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => handleMenuPress(item)}
          >
            <MaterialCommunityIcons
              name={item.icon as any}
              size={32}
              color="#10b981"
              style={styles.icon}
            />
            <Text style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
        <MaterialCommunityIcons name="logout" size={24} color="#ef4444" />
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteAccountButton} onPress={handleOpenAccountDeletion}>
        <MaterialCommunityIcons name="account-remove-outline" size={22} color="#b91c1c" />
        <Text style={styles.deleteAccountText}>Solicitar exclusão de conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '31%',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  logoutText: {
    marginLeft: 8,
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteAccountButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#fecaca',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    marginTop: -24,
    padding: 14,
  },
  deleteAccountText: {
    color: '#b91c1c',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
  },
});
