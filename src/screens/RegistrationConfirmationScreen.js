import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import QRCodeBadge from '../components/QRCodeBadge';

export default function RegistrationConfirmationScreen({ route }) {
  const { login } = useApp();
  const account = route.params?.account;

  if (!account) {
    return (
      <View style={styles.center}>
        <Text>No registration found.</Text>
      </View>
    );
  }

  const onDone = () => {
    // We already have the credentials from the form the user just submitted,
    // so we sign them straight in rather than asking them to log in again.
    login(account.email, account.password);
    // The root navigator swaps to the main app automatically once
    // isAuthenticated becomes true.
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
      <Ionicons name="checkmark-circle" size={56} color="#059669" />
      <Text style={styles.title}>You're registered!</Text>
      <Text style={styles.subtitle}>
        {account.firstName} {account.lastName} · {account.role}
      </Text>
      <Text style={styles.subtitleSmall}>{account.email}</Text>

      <View style={{ marginTop: 24, marginBottom: 24 }}>
        <QRCodeBadge registration={account} />
      </View>

      <Text style={styles.note}>
        This QR code is your digital badge — show it at the registration desk for check-in. You can
        find it again any time from the Home tab under "My Badge." Use your email and password to
        log back in later.
      </Text>

      <TouchableOpacity style={styles.doneBtn} onPress={onDone}>
        <Text style={styles.doneBtnText}>Done — log me in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginTop: 12 },
  subtitle: { fontSize: 14, color: '#374151', marginTop: 6 },
  subtitleSmall: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  note: { fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 18, paddingHorizontal: 12 },
  doneBtn: { backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40, marginTop: 24 },
  doneBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
