import React, { useRef, useEffect } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import { setOnUnauthorized } from './src/services/api';
import { initializeNotifications } from './src/services/notifications';

// Telas
import AuthLoadingScreen from './src/screens/AuthLoadingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import PatientsScreen from './src/screens/PatientsScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import MealPlansScreen from './src/screens/MealPlansScreen';
import FinancialScreen from './src/screens/FinancialScreen';
import MenuScreen from './src/screens/MenuScreen';
import PatientDetailsScreen from './src/screens/PatientDetailsScreen';
import PatientAnamnesesScreen from './src/screens/PatientAnamnesesScreen';
import PatientMeasuresScreen from './src/screens/PatientMeasuresScreen';
import PatientLabExamsScreen from './src/screens/PatientLabExamsScreen';
import PatientSupplementsScreen from './src/screens/PatientSupplementsScreen';
import PatientChatScreen from './src/screens/PatientChatScreen';
import PatientFoodDiaryScreen from './src/screens/PatientFoodDiaryScreen';
import PatientEnergyScreen from './src/screens/PatientEnergyScreen';
import PatientRecallsScreen from './src/screens/PatientRecallsScreen';
import RecipesScreen from './src/screens/RecipesScreen';
import FoodsScreen from './src/screens/FoodsScreen';
import AppSettingsScreen from './src/screens/AppSettingsScreen';
import ProfileSettingsScreen from './src/screens/ProfileSettingsScreen';
import ProfessionalMaterialsScreen from './src/screens/ProfessionalMaterialsScreen';

// Portal do Paciente
import PortalHomeScreen from './src/screens/portal/PortalHomeScreen';
import PortalFoodDiaryScreen from './src/screens/portal/PortalFoodDiaryScreen';
import PortalChatScreen from './src/screens/portal/PortalChatScreen';
import PortalMealPlansScreen from './src/screens/portal/PortalMealPlansScreen';
import PortalHydrationScreen from './src/screens/portal/PortalHydrationScreen';
import PortalGoalsScreen from './src/screens/portal/PortalGoalsScreen';
import PortalBodyRecordsScreen from './src/screens/portal/PortalBodyRecordsScreen';
import PortalLabExamsScreen from './src/screens/portal/PortalLabExamsScreen';
import PortalSupplementsScreen from './src/screens/portal/PortalSupplementsScreen';
import PortalMaterialsScreen from './src/screens/portal/PortalMaterialsScreen';
import PortalAppointmentsScreen from './src/screens/portal/PortalAppointmentsScreen';
import PortalProfileScreen from './src/screens/portal/PortalProfileScreen';
import PortalShoppingListScreen from './src/screens/portal/PortalShoppingListScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- NAVEGAÇÃO DO PACIENTE (PORTAL) ---
function PortalTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          borderTopWidth: 1,
          borderColor: '#f3f4f6',
          elevation: 0,
          shadowOpacity: 0
        }
      }}
    >
      <Tab.Screen
        name="PortalHome"
        component={PortalHomeScreen}
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home" size={24} color={color} />
        }}
      />
      <Tab.Screen
        name="PortalFoodDiary"
        component={PortalFoodDiaryScreen}
        options={{
          title: 'Diário',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="food-apple" size={24} color={color} />
        }}
      />
      <Tab.Screen
        name="PortalChat"
        component={PortalChatScreen}
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="chat-processing" size={24} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}

// Menu Principal de Abas (Bottom Tabs) do Profissional
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: true,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home" size={24} color={color} />,
          headerShown: false
        }}
      />
      <Tab.Screen
        name="PatientsTab"
        component={PatientsScreen}
        options={{
          title: 'Pacientes',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-group" size={24} color={color} />
        }}
      />
      <Tab.Screen
        name="ScheduleTab"
        component={ScheduleScreen}
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="calendar-month" size={24} color={color} />
        }}
      />
      <Tab.Screen
        name="MenuTab"
        component={MenuScreen}
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="menu" size={24} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  useEffect(() => {
    initializeNotifications().catch(() => undefined);

    setOnUnauthorized(() => {
      Alert.alert(
        'Sessão Expirada',
        'Sua sessão expirou. Faça login novamente.',
        [{ text: 'OK' }]
      );
      // Navegar para Login usando reset para limpar o stack
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    });
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <StatusBar style="auto" />
        <Stack.Navigator initialRouteName="AuthLoading">
          <Stack.Screen
            name="AuthLoading"
            component={AuthLoadingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          {/* Navegação do Profissional */}
          <Stack.Screen
            name="HomeTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          {/* Navegação do Portal (Paciente) */}
          <Stack.Screen
            name="PortalTabs"
            component={PortalTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PortalMealPlans"
            component={PortalMealPlansScreen}
            options={{ title: 'Minha Dieta' }}
          />
          <Stack.Screen
            name="PortalShoppingList"
            component={PortalShoppingListScreen}
            options={{ title: 'Lista de Compras' }}
          />
          <Stack.Screen
            name="PortalHydration"
            component={PortalHydrationScreen}
            options={{ title: 'Minha Hidratação' }}
          />
          <Stack.Screen
            name="PortalGoals"
            component={PortalGoalsScreen}
            options={{ title: 'Minhas Metas' }}
          />
          <Stack.Screen
            name="PortalBodyRecords"
            component={PortalBodyRecordsScreen}
            options={{ title: 'Evolução Corporal' }}
          />
          <Stack.Screen
            name="PortalLabExams"
            component={PortalLabExamsScreen}
            options={{ title: 'Exames' }}
          />
          <Stack.Screen
            name="PortalSupplements"
            component={PortalSupplementsScreen}
            options={{ title: 'Suplementos' }}
          />
          <Stack.Screen
            name="PortalMaterials"
            component={PortalMaterialsScreen}
            options={{ title: 'Materiais Educativos' }}
          />
          <Stack.Screen
            name="PortalAppointments"
            component={PortalAppointmentsScreen}
            options={{ title: 'Minhas Consultas' }}
          />
          <Stack.Screen
            name="PortalProfile"
            component={PortalProfileScreen}
            options={{ title: 'Meu Perfil' }}
          />

          {/* Telas que abrem por cima das abas (Stack) */}
          <Stack.Screen
            name="MealPlans"
            component={MealPlansScreen}
            options={{ title: 'Planos Alimentares' }}
          />
          <Stack.Screen
            name="Financial"
            component={FinancialScreen}
            options={{ title: 'Resumo Financeiro' }}
          />
          <Stack.Screen
            name="Patients"
            component={PatientsScreen}
            options={{ title: 'Pacientes' }}
          />
          <Stack.Screen
            name="PatientDetails"
            component={PatientDetailsScreen}
            options={{ title: 'Perfil do Paciente' }}
          />
          <Stack.Screen
            name="PatientAnamneses"
            component={PatientAnamnesesScreen}
            options={{ title: 'Questionários (Anamnese)' }}
          />
          <Stack.Screen
            name="PatientMeasures"
            component={PatientMeasuresScreen}
            options={{ title: 'Evolução e Medidas' }}
          />
          <Stack.Screen
            name="Schedule"
            component={ScheduleScreen}
            options={{ title: 'Agenda' }}
          />
          <Stack.Screen
            name="PatientLabExams"
            component={PatientLabExamsScreen}
            options={{ title: 'Exames' }}
          />
          <Stack.Screen
            name="PatientSupplements"
            component={PatientSupplementsScreen}
            options={{ title: 'Suplementos' }}
          />
          <Stack.Screen
            name="PatientChat"
            component={PatientChatScreen}
            options={{ title: 'Chat' }}
          />
          <Stack.Screen
            name="PatientFoodDiary"
            component={PatientFoodDiaryScreen}
            options={{ title: 'Diário do Paciente' }}
          />
          <Stack.Screen
            name="PatientEnergy"
            component={PatientEnergyScreen}
            options={{ title: 'Gasto Energético' }}
          />
          <Stack.Screen
            name="PatientRecalls"
            component={PatientRecallsScreen}
            options={{ title: 'Recordatórios 24h' }}
          />
          <Stack.Screen
            name="Recipes"
            component={RecipesScreen}
            options={{ title: 'Receitas' }}
          />
          <Stack.Screen
            name="Foods"
            component={FoodsScreen}
            options={{ title: 'Alimentos' }}
          />
          <Stack.Screen
            name="AppSettings"
            component={AppSettingsScreen}
            options={{ title: 'Configurações do App' }}
          />
          <Stack.Screen
            name="ProfileSettings"
            component={ProfileSettingsScreen}
            options={{ title: 'Meu Perfil' }}
          />
          <Stack.Screen
            name="ProfessionalMaterials"
            component={ProfessionalMaterialsScreen}
            options={{ title: 'Materiais' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
