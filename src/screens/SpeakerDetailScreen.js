import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';

export default function SpeakerDetailScreen({ route }) {
  const { speakerId } = route.params;
  const { speakers, sessions, t, localize } = useApp();
  const speaker = speakers.find((s) => s.id === speakerId);

  if (!speaker) {
    return (
      <View style={styles.center}>
        <Text>{t('speakerDetail.notFound')}</Text>
      </View>
    );
  }

  const speakerSessions = sessions.filter((s) => s.speakerIds.includes(speakerId));

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.header}>
        <Image source={{ uri: speaker.photo }} style={styles.avatar} />
        <Text style={styles.name}>{speaker.name}</Text>
        <Text style={styles.title}>{localize(speaker.title)}</Text>
      </View>
      <Text style={styles.bio}>{localize(speaker.bio)}</Text>

      <Text style={styles.sectionLabel}>{t('speakerDetail.sessions')}</Text>
      {speakerSessions.map((s) => (
        <View key={s.id} style={styles.sessionRow}>
          <Text style={styles.sessionTitle}>{localize(s.title)}</Text>
          <Text style={styles.sessionMeta}>{localize(s.day)} · {s.startTime}–{s.endTime} · {localize(s.room)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 16 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#E5E7EB', marginBottom: 10 },
  name: { fontSize: 19, fontWeight: '800', color: '#111827' },
  title: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  bio: { fontSize: 14, color: '#374151', lineHeight: 20, marginBottom: 10 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 12, marginBottom: 8 },
  sessionRow: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 8 },
  sessionTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  sessionMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
});
