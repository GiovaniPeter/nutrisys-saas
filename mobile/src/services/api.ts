import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.trim().replace(/\/+$/, '');
}

// O app instalado precisa apontar para um endpoint HTTPS acessivel fora da maquina local.
export const PRODUCTION_API_BASE_URL = 'https://nutrisys-pro.vercel.app/api';
export const ACCOUNT_DELETION_URL = 'https://nutrisys-pro-rho.vercel.app/exclusao-de-conta';
export const PRIVACY_POLICY_URL = 'https://nutrisys-pro-rho.vercel.app/politica-de-privacidade';
export const PASSWORD_RECOVERY_URL = 'https://nutrisys-pro-rho.vercel.app/recuperar-senha';
// Android Emulator acessa o host por 10.0.2.2. Celular fisico usa o IP do Wi-Fi.
export const ANDROID_EMULATOR_API_BASE_URL = 'http://10.0.2.2:3000/api';
export const LAN_API_BASE_URL = 'http://192.168.1.6:3000/api';
export const LOCALHOST_API_BASE_URL = 'http://localhost:3000/api';
export const DEFAULT_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL
  ? normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL)
  : PRODUCTION_API_BASE_URL;
export const API_BASE_URL_STORAGE_KEY = '@NutriPlan:apiBaseUrl';

export const api = axios.create({
  baseURL: DEFAULT_API_BASE_URL,
  timeout: 10000, // 10 segundos de timeout para evitar travamentos
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getApiBaseUrl() {
  const storedBaseUrl = await AsyncStorage.getItem(API_BASE_URL_STORAGE_KEY);
  if (!storedBaseUrl) {
    return DEFAULT_API_BASE_URL;
  }

  const normalizedBaseUrl = normalizeBaseUrl(storedBaseUrl);

  if (
    DEFAULT_API_BASE_URL === PRODUCTION_API_BASE_URL
    && [LAN_API_BASE_URL, LOCALHOST_API_BASE_URL].includes(normalizedBaseUrl)
  ) {
    await AsyncStorage.setItem(API_BASE_URL_STORAGE_KEY, DEFAULT_API_BASE_URL);
    return DEFAULT_API_BASE_URL;
  }

  return normalizedBaseUrl;
}

export async function setApiBaseUrl(baseUrl: string) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  await AsyncStorage.setItem(API_BASE_URL_STORAGE_KEY, normalizedBaseUrl);
  api.defaults.baseURL = normalizedBaseUrl;
}

// Interceptor para injetar o token de autenticação
api.interceptors.request.use(async (config) => {
  try {
    config.baseURL = await getApiBaseUrl();
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
