import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function SessionDetailScreen({ route }) {
  const { sessionId } = route.params;
  const { sessions, speakers, favorites, toggleFavorite, currentUser, t, localize } = useApp();
  const session = sessions.find((s) => s.id === sessionId);

  if (!session) {
    return (
      <View style={styles.center}>
        <Text>{t('sessionDetail.notFound')}</Text>
      </View>
    );
  }

  const isFavorite = favorites.includes(sessionId);
  const isSignedUp = !!currentUser && (currentUser.sessionIds || []).includes(sessionId);
  const sessionSpeakers = session.speakerIds.map((id) => speakers.find((s) => s.id === id)).filter(Boolean);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{localize(session.title)}</Text>
        <TouchableOpacity onPress={() => toggleFavorite(sessionId)}>
          <Ionicons name={isFavorite ? 'star' : 'star-outline'} size={26} color={isFavorite ? '#E8A93A' : '#9AA0A6'} />
        </TouchableOpacity>
      </View>
      <Text style={styles.meta}>{localize(session.day)} · {session.startTime}–{session.endTime}</Text>
      <Text style={styles.meta}>{localize(session.room)} · {localize(session.track)}</Text>
      {isSignedUp && <Text style={styles.signedUp}>{t('sessionDetail.signedUp')}</Text>}
      {session.updatedAt && <Text style={styles.updated}>{t('sessionDetail.updated')}</Text>}

      <Text style={styles.sectionLabel}>{t('sessionDetail.about')}</Text>
      <Text style={styles.description}>{localize(session.description)}</Text>

      <Text style={styles.sectionLabel}>{t('sessionDetail.speakers')}</Text>
      {sessionSpeakers.map((sp) => (
        <View key={sp.id} style={styles.speakerRow}>
          <Text style={styles.speakerName}>{sp.name}</Text>
          <Text style={styles.speakerTitle}>{localize(sp.title)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 20, fontWeight: '800', color: '#111827', flex: 1, marginRight: 12 },
  meta: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  signedUp: { fontSize: 12, color: '#065F46', fontWeight: '700', marginTop: 8 },
  updated: { fontSize: 12, color: '#92400E', backgroundColor: '#FEF3C7', padding: 8, borderRadius: 8, marginTop: 10 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 20, marginBottom: 6 },
  description: { fontSize: 14, color: '#374151', lineHeight: 20 },
  speakerRow: { marginBottom: 10 },
  speakerName: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  speakerTitle: { fontSize: 12, color: '#6B7280' },
});
