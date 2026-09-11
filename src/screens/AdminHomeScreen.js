import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const ITEMS = [
  { key: 'ManageParticipants', icon: 'people-circle-outline', label: 'Manage participants', desc: 'Overview, search, filter, add, edit, export, and delete registrations' },
  { key: 'ManageProgram', icon: 'calendar-outline', label: 'Manage program', desc: 'Add, edit, or remove sessions' },
  { key: 'ManageSpeakers', icon: 'people-outline', label: 'Manage speakers', desc: 'Add, edit, or remove speakers' },
  { key: 'ManageOrgInfo', icon: 'information-circle-outline', label: 'Manage organizational info', desc: 'Venue, parking, catering, and more' },
  { key: 'ManageAnnouncements', icon: 'megaphone-outline', label: 'Announcements', desc: 'Full history of every announcement sent, and send new ones' },
  { key: 'CheckInScanner', icon: 'qr-code-outline', label: 'Check-in scanner', desc: 'Scan a badge QR code to record attendance' },
];

export default function AdminHomeScreen({ navigation }) {
  const { hasAdminAccess } = useApp();

  if (!hasAdminAccess) {
    return (
      <View style={styles.restricted}>
        <Text style={styles.restrictedText}>Administrator access required. Please log out and log back in as an administrator.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.note}>
        This is a demo organizer area, protected by the administrator login. In a real deployment this would sit
        behind proper server-side authentication rather than a hardcoded password.
      </Text>

      {ITEMS.map((item) => (
        <TouchableOpacity key={item.key} style={styles.row} onPress={() => navigation.navigate(item.key)}>
          <Ionicons name={item.icon} size={22} color="#4F46E5" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Text style={styles.rowDesc}>{item.desc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  restricted: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  restrictedText: { fontSize: 14, color: '#DC2626', textAlign: 'center' },
  note: { fontSize: 12, color: '#6B7280', marginBottom: 16, lineHeight: 17 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10 },
  rowLabel: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  rowDesc: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  footerNote: { fontSize: 11, color: '#9CA3AF', marginTop: 10, lineHeight: 16 },
});
