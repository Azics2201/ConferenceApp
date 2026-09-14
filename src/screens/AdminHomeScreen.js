import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const ITEMS = [
  { key: 'ManageParticipants', icon: 'people-circle-outline', i18nKey: 'manageParticipants' },
  { key: 'ManageProgram', icon: 'calendar-outline', i18nKey: 'manageProgram' },
  { key: 'ManageSpeakers', icon: 'people-outline', i18nKey: 'manageSpeakers' },
  { key: 'ManageOrgInfo', icon: 'information-circle-outline', i18nKey: 'manageOrgInfo' },
  { key: 'ManageAnnouncements', icon: 'megaphone-outline', i18nKey: 'manageAnnouncements' },
  { key: 'CheckInScanner', icon: 'qr-code-outline', i18nKey: 'checkInScanner' },
];

export default function AdminHomeScreen({ navigation }) {
  const { hasAdminAccess, t } = useApp();

  if (!hasAdminAccess) {
    return (
      <View style={styles.restricted}>
        <Text style={styles.restrictedText}>{t('adminHome.restricted')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.note}>{t('adminHome.note')}</Text>

      {ITEMS.map((item) => (
        <TouchableOpacity key={item.key} style={styles.row} onPress={() => navigation.navigate(item.key)}>
          <Ionicons name={item.icon} size={22} color="#4D92CF" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.rowLabel}>{t(`adminHome.items.${item.i18nKey}.label`)}</Text>
            <Text style={styles.rowDesc}>{t(`adminHome.items.${item.i18nKey}.desc`)}</Text>
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
