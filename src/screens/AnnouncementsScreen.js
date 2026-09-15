import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import AnnouncementCard, { timeAgo } from '../components/AnnouncementCard';

function describeAudience(audience, sessions, t, localize) {
  if (!audience || audience.type === 'all') return t('announcements.allParticipants');
  if (audience.type === 'role') return t('announcements.roleOnly', { role: t(`roles.${audience.role}`) });
  if (audience.type === 'session') {
    const s = sessions.find((x) => x.id === audience.sessionId);
    return s ? t('announcements.attendeesOf', { title: localize(s.title) }) : t('announcements.attendeesOfSpecificSession');
  }
  return t('announcements.allParticipants');
}

export default function AnnouncementsScreen() {
  const { announcements, sessions, t, localize } = useApp();
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={announcements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AnnouncementCard
            announcement={item}
            audienceLabel={describeAudience(item.audience, sessions, t, localize)}
            onPress={() => setSelectedAnnouncement(item)}
          />
        )}
      />

      <Modal visible={!!selectedAnnouncement} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedAnnouncement && (
              <ScrollView>
                <Text style={styles.detailTitle}>{localize(selectedAnnouncement.title)}</Text>
                <Text style={styles.detailMeta}>
                  {timeAgo(selectedAnnouncement.timestamp, t)} · {new Date(selectedAnnouncement.timestamp).toLocaleString()}
                </Text>
                <Text style={styles.detailAudience}>{t('announcements.to', { audience: describeAudience(selectedAnnouncement.audience, sessions, t, localize) })}</Text>
                <Text style={styles.detailBody}>{localize(selectedAnnouncement.body)}</Text>
              </ScrollView>
            )}
            <TouchableOpacity style={styles.closeDetailBtn} onPress={() => setSelectedAnnouncement(null)}>
              <Text style={styles.closeDetailText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '85%' },
  detailTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 6 },
  detailMeta: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  detailAudience: { fontSize: 12, color: '#4D92CF', fontWeight: '600', marginBottom: 14 },
  detailBody: { fontSize: 14, color: '#374151', lineHeight: 21 },
  closeDetailBtn: { paddingVertical: 14, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E5E7EB', marginTop: 12 },
  closeDetailText: { color: '#4D92CF', fontWeight: '700', fontSize: 15 },
});
