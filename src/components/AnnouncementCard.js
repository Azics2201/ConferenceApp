import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';

export function timeAgo(iso, t) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return t('common.justNow');
  if (mins < 60) return t('common.minutesAgo', { n: mins });
  const hours = Math.round(mins / 60);
  if (hours < 24) return t('common.hoursAgo', { n: hours });
  const days = Math.round(hours / 24);
  return t('common.daysAgo', { n: days });
}

const TRUNCATE_LINES = 3;

export default function AnnouncementCard({ announcement, audienceLabel, onPress }) {
  const { t } = useApp();
  const isHigh = announcement.priority === 'high';
  const isLong = announcement.body.length > 160 || announcement.body.split('\n').length > TRUNCATE_LINES;

  return (
    <TouchableOpacity
      style={[styles.card, isHigh && styles.cardHigh]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>{announcement.title}</Text>
        <Text style={styles.time}>{timeAgo(announcement.timestamp, t)}</Text>
      </View>
      <Text style={styles.body} numberOfLines={TRUNCATE_LINES}>
        {announcement.body}
      </Text>
      {isLong && onPress && <Text style={styles.readMore}>{t('common.readMore')}</Text>}
      {!!audienceLabel && <Text style={styles.audience}>{t('announcements.to', { audience: audienceLabel })}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#4D92CF' },
  cardHigh: { borderLeftColor: '#DC2626' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontSize: 15, fontWeight: '700', color: '#1F2937', flex: 1, marginRight: 8 },
  time: { fontSize: 11, color: '#9CA3AF' },
  body: { fontSize: 13, color: '#4B5563', lineHeight: 18 },
  readMore: { fontSize: 12, color: '#4D92CF', fontWeight: '700', marginTop: 6 },
  audience: { fontSize: 11, color: '#9CA3AF', marginTop: 6, fontWeight: '600' },
});
