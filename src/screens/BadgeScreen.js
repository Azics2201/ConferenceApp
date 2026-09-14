import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import QRCodeBadge from '../components/QRCodeBadge';

export default function BadgeScreen() {
  const { currentUser, sessions, t } = useApp();

  if (!currentUser) {
    return (
      <View style={styles.center}>
        <Text>{t('badge.noAccount')}</Text>
      </View>
    );
  }

  const mySessions = sessions.filter((s) => (currentUser.sessionIds || []).includes(s.id));

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
      <Text style={styles.name}>{currentUser.firstName} {currentUser.lastName}</Text>
      <Text style={styles.meta}>{currentUser.organization}{currentUser.organization ? ' · ' : ''}{currentUser.jobTitle}</Text>
      <Text style={styles.role}>{t(`roles.${currentUser.role}`)}</Text>

      <View style={{ marginVertical: 20 }}>
        <QRCodeBadge registration={currentUser} />
      </View>

      {mySessions.length > 0 && (
        <View style={{ width: '100%' }}>
          <Text style={styles.sectionLabel}>{t('badge.yourSessions')}</Text>
          {mySessions.map((s) => (
            <View key={s.id} style={styles.sessionRow}>
              <Text style={styles.sessionTitle}>{s.title}</Text>
              <Text style={styles.sessionMeta}>{s.day} · {s.startTime}–{s.endTime} · {s.room}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  name: { fontSize: 20, fontWeight: '800', color: '#111827' },
  meta: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  role: { fontSize: 12, color: '#4D92CF', fontWeight: '700', marginTop: 4 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8 },
  sessionRow: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 8, width: '100%' },
  sessionTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  sessionMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
});
