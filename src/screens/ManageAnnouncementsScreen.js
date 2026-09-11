import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import AnnouncementCard, { timeAgo } from '../components/AnnouncementCard';

const ROLES = ['Attendee', 'Speaker', 'Press', 'Organizer'];
const AUDIENCE_TYPES = [
  { key: 'all', label: 'All participants' },
  { key: 'session', label: 'By session' },
  { key: 'role', label: 'By role' },
];

function describeAudience(audience, sessions) {
  if (!audience || audience.type === 'all') return 'All participants';
  if (audience.type === 'role') return `${audience.role} only`;
  if (audience.type === 'session') {
    const s = sessions.find((x) => x.id === audience.sessionId);
    return s ? `Attendees of "${s.title}"` : 'Attendees of a specific session';
  }
  return 'All participants';
}

export default function ManageAnnouncementsScreen() {
  const { hasAdminAccess, announcements, addAnnouncement, sessions } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audienceType, setAudienceType] = useState('all');
  const [audienceRole, setAudienceRole] = useState(ROLES[0]);
  const [audienceSessionId, setAudienceSessionId] = useState(sessions[0]?.id);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const onSend = async () => {
    if (!hasAdminAccess) return;
    if (!title.trim() || !body.trim()) return;
    const audience =
      audienceType === 'role'
        ? { type: 'role', role: audienceRole }
        : audienceType === 'session'
        ? { type: 'session', sessionId: audienceSessionId }
        : { type: 'all' };
    await addAnnouncement(title.trim(), body.trim(), audience);
    setTitle('');
    setBody('');
    setAudienceType('all');
    setModalVisible(false);
  };

  if (!hasAdminAccess) {
    return (
      <View style={styles.restricted}>
        <Text style={styles.restrictedText}>Administrator access required.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        // Deliberately the full, unfiltered list — the audience field on
        // each announcement is a targeting label for participants, not a
        // filter on what the admin sees here. Admin always sees everything
        // that's ever been sent, regardless of who it was targeted to.
        data={announcements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AnnouncementCard
            announcement={item}
            audienceLabel={describeAudience(item.audience, sessions)}
            onPress={() => setSelectedAnnouncement(item)}
          />
        )}
        ListHeaderComponent={
          <View>
            <Text style={styles.note}>
              Every announcement ever sent, regardless of audience targeting. Participants only see this same list
              on the Updates tab (targeting is a label here, not an actual per-device filter — see the README).
            </Text>
            <TouchableOpacity style={styles.demoBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.demoBtnText}>+ Send an announcement</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal visible={!!selectedAnnouncement} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedAnnouncement && (
              <ScrollView>
                <Text style={styles.detailTitle}>{selectedAnnouncement.title}</Text>
                <Text style={styles.detailMeta}>
                  {timeAgo(selectedAnnouncement.timestamp)} · {new Date(selectedAnnouncement.timestamp).toLocaleString()}
                </Text>
                <Text style={styles.detailAudience}>To: {describeAudience(selectedAnnouncement.audience, sessions)}</Text>
                <Text style={styles.detailBody}>{selectedAnnouncement.body}</Text>
              </ScrollView>
            )}
            <TouchableOpacity style={styles.closeDetailBtn} onPress={() => setSelectedAnnouncement(null)}>
              <Text style={styles.closeDetailText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView>
              <Text style={styles.modalTitle}>Send announcement</Text>
              <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Message"
                value={body}
                onChangeText={setBody}
                multiline
              />

              <Text style={styles.label}>Send to</Text>
              <View style={styles.chipRow}>
                {AUDIENCE_TYPES.map((a) => (
                  <TouchableOpacity
                    key={a.key}
                    style={[styles.chip, audienceType === a.key && styles.chipActive]}
                    onPress={() => setAudienceType(a.key)}
                  >
                    <Text style={[styles.chipText, audienceType === a.key && styles.chipTextActive]}>{a.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {audienceType === 'role' && (
                <View style={styles.chipRow}>
                  {ROLES.map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.chip, audienceRole === r && styles.chipActive]}
                      onPress={() => setAudienceRole(r)}
                    >
                      <Text style={[styles.chipText, audienceRole === r && styles.chipTextActive]}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {audienceType === 'session' && (
                <View>
                  {sessions.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={[styles.sessionOption, audienceSessionId === s.id && styles.sessionOptionActive]}
                      onPress={() => setAudienceSessionId(s.id)}
                    >
                      <Text style={styles.sessionOptionText}>{s.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.hint}>
                In production, targeting would filter real stored push tokens on a server. Here it's a demo — the
                notification still fires locally so you can see the flow, and this admin view always shows every
                announcement regardless of targeting.
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onSend}>
                  <Text style={styles.send}>Send</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  restricted: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  restrictedText: { fontSize: 14, color: '#DC2626', textAlign: 'center' },
  note: { fontSize: 12, color: '#6B7280', marginBottom: 12, lineHeight: 17 },
  demoBtn: { backgroundColor: '#EEF2FF', borderRadius: 10, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#C7D2FE', borderStyle: 'dashed' },
  demoBtnText: { color: '#4338CA', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '85%' },
  modalTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 10 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 6, marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#4F46E5' },
  chipText: { fontSize: 13, color: '#374151' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  sessionOption: { padding: 10, borderRadius: 8, backgroundColor: '#F9FAFB', marginBottom: 6 },
  sessionOptionActive: { backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#4F46E5' },
  sessionOptionText: { fontSize: 13, color: '#1F2937' },
  hint: { fontSize: 11, color: '#9CA3AF', marginTop: 10, marginBottom: 14 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', paddingBottom: 10 },
  cancel: { color: '#6B7280', fontWeight: '600', marginRight: 20 },
  send: { color: '#4F46E5', fontWeight: '700' },
  detailTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 6 },
  detailMeta: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  detailAudience: { fontSize: 12, color: '#4F46E5', fontWeight: '600', marginBottom: 14 },
  detailBody: { fontSize: 14, color: '#374151', lineHeight: 21 },
  closeDetailBtn: { paddingVertical: 14, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E5E7EB', marginTop: 12 },
  closeDetailText: { color: '#4F46E5', fontWeight: '700', fontSize: 15 },
});
