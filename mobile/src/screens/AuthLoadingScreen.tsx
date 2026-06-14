import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, getApiBaseUrl } from '../services/api';

export default function AuthLoadingScreen({ navigation }: any) {
  useEffect(() => {
    async function restoreSession() {
      const [token, role, apiBaseUrl] = await Promise.all([
        AsyncStorage.getItem('@NutriPlan:token'),
        AsyncStorage.getItem('@NutriPlan:role'),
        getApiBaseUrl(),
      ]);

      api.defaults.baseURL = apiBaseUrl;

      if (!token) {
        navigation.replace('Login');
        return;
      }

      navigation.replace(role === 'PATIENT' ? 'PortalTabs' : 'HomeTabs');
    }

    restoreSession();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>NutreClin</Text>
      <ActivityIndicator size="large" color="#10b981" />
      <Text style={styles.caption}>Carregando seu acesso...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    color: '#10b981',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  caption: {
    color: '#6b7280',
    fontSize: 15,
    marginTop: 14,
  },
});
