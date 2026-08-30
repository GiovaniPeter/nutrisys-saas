import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.trim().replace(/\/+$/, '');
}

// O app instalado precisa apontar para um endpoint HTTPS acessivel fora da maquina local.
export const PRODUCTION_API_BASE_URL = 'https://clinos.tec.br/api';
export const ACCOUNT_DELETION_URL = 'https://clinos.tec.br/exclusao-de-conta';
export const PRIVACY_POLICY_URL = 'https://clinos.tec.br/politica-de-privacidade';
export const PASSWORD_RECOVERY_URL = 'https://clinos.tec.br/recuperar-senha';
export const DEFAULT_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL
  ? normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL)
  : PRODUCTION_API_BASE_URL;

export const api = axios.create({
  baseURL: DEFAULT_API_BASE_URL,
  timeout: 10000, // 10 segundos de timeout para evitar travamentos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar o token de autenticação
api.interceptors.request.use(async (config) => {
  try {
    config.baseURL = DEFAULT_API_BASE_URL;
    const token = await AsyncStorage.getItem('@NutriPlan:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    // Ignora erro
  }
  return config;
});

// Interceptor de resposta para auto-logout em 401 (sessão expirada)
let isLoggingOut = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !isLoggingOut) {
      isLoggingOut = true;
      try {
        await Promise.all([
          AsyncStorage.removeItem('@NutriPlan:token'),
          AsyncStorage.removeItem('@NutriPlan:user'),
          AsyncStorage.removeItem('@NutriPlan:role'),
        ]);
        // Emite evento para navegação global reagir
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback();
        }
      } catch (err) {
        // Ignora erro de limpeza
      } finally {
        isLoggingOut = false;
      }
    }
    return Promise.reject(error);
  }
);

// Callback para navegação global ao detectar 401
let onUnauthorizedCallback: (() => void) | null = null;

export function setOnUnauthorized(callback: () => void) {
  onUnauthorizedCallback = callback;
}
