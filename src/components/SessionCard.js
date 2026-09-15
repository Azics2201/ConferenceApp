import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function SessionCard({ session, onPress, isFavorite, onToggleFavorite }) {
  const { speakers, currentUser, t, localize } = useApp();
  const speakerNames = session.speakerIds
    .map((id) => speakers.find((s) => s.id === id)?.name)
    .filter(Boolean)
    .join(', ');
  const isSignedUp = !!currentUser && (currentUser.sessionIds || []).includes(session.id);

  return (
    <TouchableOpacity style={[styles.card, isSignedUp && styles.cardSignedUp]} onPress={onPress}>
      <View style={styles.timeCol}>
        <Text style={styles.time}>{session.startTime}</Text>
        <Text style={styles.timeEnd}>{session.endTime}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>{localize(session.title)}</Text>
          {onToggleFavorite && (
            <TouchableOpacity onPress={onToggleFavorite} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons
                name={isFavorite ? 'star' : 'star-outline'}
                size={20}
                color={isFavorite ? '#E8A93A' : '#9AA0A6'}
              />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.meta}>{localize(session.room)} · {localize(session.track)}</Text>
        {!!speakerNames && <Text style={styles.speakers}>{speakerNames}</Text>}
        <View style={styles.badgeRow}>
          {isSignedUp && (
            <View style={styles.signedUpBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#065F46" />
              <Text style={styles.signedUpText}>{t('sessionCard.signedUp')}</Text>
            </View>
          )}
          {session.updatedAt && (
            <View style={styles.changedBadge}>
              <Text style={styles.changedText}>{t('sessionCard.updated')}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardSignedUp: { borderColor: '#A7F3D0', backgroundColor: '#F0FDF9' },
  timeCol: { width: 56, marginRight: 12 },
  time: { fontWeight: '700', fontSize: 13, color: '#1F2937' },
  timeEnd: { fontSize: 12, color: '#9AA0A6' },
  body: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 15, fontWeight: '600', color: '#1F2937', flex: 1, marginRight: 8 },
  meta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  speakers: { fontSize: 12, color: '#4B5563', marginTop: 4, fontStyle: 'italic' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  signedUpBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginRight: 6, marginBottom: 4 },
  signedUpText: { fontSize: 10, color: '#065F46', fontWeight: '700', marginLeft: 4 },
  changedBadge: { alignSelf: 'flex-start', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginBottom: 4 },
  changedText: { fontSize: 10, color: '#92400E', fontWeight: '700' },
});
