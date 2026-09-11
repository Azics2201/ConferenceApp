import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

// In production, announcements would be pushed from a server to each
// attendee's stored Expo push token. Here we schedule a local notification
// immediately so the flow is demonstrable without a backend.
export async function scheduleLocalNotification(title, body) {
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return;
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  } catch (e) {
    console.warn('Notification scheduling failed', e);
  }
}
