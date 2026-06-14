import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const MEAL_CHANNEL_ID = 'meal-reminders';
const HYDRATION_CHANNEL_ID = 'hydration-reminders';
const FEEDBACK_CHANNEL_ID = 'diary-feedback';
const NOTIFIED_FEEDBACK_STORAGE_KEY = '@NutriPlan:notifiedFoodDiaryFeedback';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function initializeNotifications() {
  if (Platform.OS === 'android') {
    await Promise.all([
      Notifications.setNotificationChannelAsync(MEAL_CHANNEL_ID, {
        name: 'Lembretes de refeição',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10b981',
      }),
      Notifications.setNotificationChannelAsync(HYDRATION_CHANNEL_ID, {
        name: 'Lembretes de hidratação',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 200],
        lightColor: '#3b82f6',
      }),
      Notifications.setNotificationChannelAsync(FEEDBACK_CHANNEL_ID, {
        name: 'Feedback do diário alimentar',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#f59e0b',
      }),
    ]);
  }

  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === 'granted') return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}

export async function scheduleMealRemindersFromPlans(plans: any[]) {
  const hasPermission = await initializeNotifications();
  if (!hasPermission) return;

  const times = new Map<string, { hour: number; minute: number; label: string }>();

  plans.forEach((plan) => {
    plan.meals?.forEach((meal: any) => {
      const parsed = parseTime(meal.time);
      if (!parsed) return;

      const key = `${parsed.hour}:${parsed.minute}`;
      if (!times.has(key)) {
        times.set(key, {
          ...parsed,
          label: meal.label || 'Refeição',
        });
      }
    });
  });

  await Promise.all(
    Array.from(times.values()).slice(0, 12).map(async ({ hour, minute, label }) => {
      const identifier = `nutriplan-meal-${hour}-${minute}`;
      await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => undefined);
      await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title: 'Hora da refeição',
          body: `${label}: confira seu plano alimentar antes de comer.`,
          data: { screen: 'PortalMealPlans' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          channelId: MEAL_CHANNEL_ID,
          hour,
          minute,
        },
      });
    })
  );
}

export async function scheduleHydrationReminders() {
  const hasPermission = await initializeNotifications();
  if (!hasPermission) return;

  const reminders = [
    { hour: 9, minute: 0 },
    { hour: 12, minute: 0 },
    { hour: 15, minute: 0 },
    { hour: 18, minute: 0 },
  ];

  await Promise.all(
    reminders.map(async ({ hour, minute }) => {
      const identifier = `nutriplan-hydration-${hour}-${minute}`;
      await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => undefined);
      await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title: 'Hidratação',
          body: 'Registre sua água e acompanhe sua meta do dia.',
          data: { screen: 'PortalHydration' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          channelId: HYDRATION_CHANNEL_ID,
          hour,
          minute,
        },
      });
    })
  );
}

export async function notifyFoodDiaryFeedback(entries: any[]) {
  const hasPermission = await initializeNotifications();
  if (!hasPermission) return;

  const raw = await AsyncStorage.getItem(NOTIFIED_FEEDBACK_STORAGE_KEY);
  const notifiedIds = new Set<string>(raw ? JSON.parse(raw) : []);
  const nextNotifiedIds = new Set(notifiedIds);

  for (const entry of entries) {
    if (!entry?.id || notifiedIds.has(entry.id) || entry.status === 'PENDING' || !entry.feedbackAt) {
      continue;
    }

    nextNotifiedIds.add(entry.id);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Seu diário foi avaliado',
        body: entry.feedbackNote || statusToNotificationText(entry.status),
        data: { screen: 'PortalFoodDiary', entryId: entry.id },
      },
      trigger: { channelId: FEEDBACK_CHANNEL_ID },
    });
  }

  if (nextNotifiedIds.size !== notifiedIds.size) {
    await AsyncStorage.setItem(
      NOTIFIED_FEEDBACK_STORAGE_KEY,
      JSON.stringify(Array.from(nextNotifiedIds).slice(-100))
    );
  }
}

function parseTime(value?: string | null) {
  if (!value) return null;

  const normalized = value.trim().toLowerCase().replace('h', ':');
  const match = normalized.match(/^(\d{1,2})(?::(\d{1,2}))?/);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2] || 0);

  if (Number.isNaN(hour) || Number.isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return { hour, minute };
}

function statusToNotificationText(status: string) {
  if (status === 'APPROVED') return 'Sua refeição foi aprovada pelo nutricionista.';
  if (status === 'NEEDS_ADJUSTMENT') return 'Seu nutricionista deixou um ajuste para esta refeição.';
  return 'Há uma atualização no seu diário alimentar.';
}
