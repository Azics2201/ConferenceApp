import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import AnnouncementCard, { timeAgo } from '../components/AnnouncementCard';
import ConfirmModal from '../components/ConfirmModal';
import BilingualField from '../components/BilingualField';
import { isBilingualFilled } from '../utils/bilingual';

const ROLES = ['Attendee', 'Speaker', 'Press', 'Organizer'];

function describeAudience(audience, sessions, t, localize) {
  if (!audience || audience.type === 'all') return t('announcements.allParticipants');
  if (audience.type === 'role') return t('announcements.roleOnly', { role: t(`roles.${audience.role}`) });
  if (audience.type === 'session') {
    const s = sessions.find((x) => x.id === audience.sessionId);
    return s ? t('announcements.attendeesOf', { title: localize(s.title) }) : t('announcements.attendeesOfSpecificSession');
  }
  return t('announcements.allParticipants');
}

export default function ManageAnnouncementsScreen() {
  const { hasAdminAccess, announcements, addAnnouncement, deleteAnnouncement, sessions, t, localize } = useApp();
  const AUDIENCE_TYPES = [
    { key: 'all', label: t('manageAnnouncements.audienceAll') },
    { key: 'session', label: t('manageAnnouncements.audienceBySession') },
    { key: 'role', label: t('manageAnnouncements.audienceByRole') },
  ];
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState({ en: '', cs: '' });
  const [body, setBody] = useState({ en: '', cs: '' });
  const [audienceType, setAudienceType] = useState('all');
  const [audienceRole, setAudienceRole] = useState(ROLES[0]);
  const [audienceSessionId, setAudienceSessionId] = useState(sessions[0]?.id);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const setBilingual = (setter) => (lang) => (value) => setter((f) => ({ ...f, [lang]: value }));

  const confirmDelete = () => {
    if (deleteTarget) deleteAnnouncement(deleteTarget.id);
    setDeleteTarget(null);
    setSelectedAnnouncement(null);
  };

  const onSend = async () => {
    if (!hasAdminAccess) return;
    if (!isBilingualFilled(title) || !isBilingualFilled(body)) {
      return Alert.alert(t('common.bothLanguagesRequired'));
    }
    const audience =
      audienceType === 'role'
        ? { type: 'role', role: audienceRole }
        : audienceType === 'session'
        ? { type: 'session', sessionId: audienceSessionId }
        : { type: 'all' };
    await addAnnouncement(
      { en: title.en.trim(), cs: title.cs.trim() },
      { en: body.en.trim(), cs: body.cs.trim() },
      audience
    );
    setTitle({ en: '', cs: '' });
    setBody({ en: '', cs: '' });
    setAudienceType('all');
    setModalVisible(false);
  };

  if (!hasAdminAccess) {
    return (
      <View style={styles.restricted}>
        <Text style={styles.restrictedText}>{t('manageAnnouncements.restricted')}</Text>
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
            audienceLabel={describeAudience(item.audience, sessions, t, localize)}
            onPress={() => setSelectedAnnouncement(item)}
          />
        )}
        ListHeaderComponent={
          <View>
            <Text style={styles.note}>{t('manageAnnouncements.note')}</Text>
            <TouchableOpacity style={styles.demoBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.demoBtnText}>{t('manageAnnouncements.send')}</Text>
            </TouchableOpacity>
          </View>
        }
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
            <View style={styles.detailActions}>
              <TouchableOpacity
                style={styles.deleteDetailBtn}
                onPress={() => setDeleteTarget(selectedAnnouncement)}
              >
                <Text style={styles.deleteDetailText}>{t('manageAnnouncements.deleteLabel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeDetailBtn} onPress={() => setSelectedAnnouncement(null)}>
                <Text style={styles.closeDetailText}>{t('common.close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={!!deleteTarget}
        title={t('manageAnnouncements.deleteTitle')}
        body={deleteTarget ? t('manageAnnouncements.deleteBody', { title: localize(deleteTarget.title) }) : ''}
        confirmLabel={t('manageAnnouncements.deleteLabel')}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView>
              <Text style={styles.modalTitle}>{t('manageAnnouncements.sendTitle')}</Text>
              <BilingualField
                valueEn={title.en}
                valueCs={title.cs}
                onChangeEn={setBilingual(setTitle)('en')}
                onChangeCs={setBilingual(setTitle)('cs')}
                placeholder={t('manageAnnouncements.titlePlaceholder')}
              />
              <BilingualField
                valueEn={body.en}
                valueCs={body.cs}
                onChangeEn={setBilingual(setBody)('en')}
                onChangeCs={setBilingual(setBody)('cs')}
                placeholder={t('manageAnnouncements.messagePlaceholder')}
                multiline
              />

              <Text style={styles.label}>{t('manageAnnouncements.sendToLabel')}</Text>
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
                      <Text style={[styles.chipText, audienceRole === r && styles.chipTextActive]}>{t(`roles.${r}`)}</Text>
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
                      <Text style={styles.sessionOptionText}>{localize(s.title)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.hint}>{t('manageAnnouncements.hint')}</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancel}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onSend}>
                  <Text style={styles.send}>{t('manageAnnouncements.sendAction')}</Text>
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
  demoBtn: { backgroundColor: '#E4EFF8', borderRadius: 10, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#AFCEE9', borderStyle: 'dashed' },
  demoBtnText: { color: '#4F5D1B', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '85%' },
  modalTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 10 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 6, marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#4D92CF' },
  chipText: { fontSize: 13, color: '#374151' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  sessionOption: { padding: 10, borderRadius: 8, backgroundColor: '#F9FAFB', marginBottom: 6 },
  sessionOptionActive: { backgroundColor: '#E4EFF8', borderWidth: 1, borderColor: '#4D92CF' },
  sessionOptionText: { fontSize: 13, color: '#1F2937' },
  hint: { fontSize: 11, color: '#9CA3AF', marginTop: 10, marginBottom: 14 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', paddingBottom: 10 },
  cancel: { color: '#6B7280', fontWeight: '600', marginRight: 20 },
  send: { color: '#4D92CF', fontWeight: '700' },
  detailTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 6 },
  detailMeta: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  detailAudience: { fontSize: 12, color: '#4D92CF', fontWeight: '600', marginBottom: 14 },
  detailBody: { fontSize: 14, color: '#374151', lineHeight: 21 },
  detailActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#E5E7EB', marginTop: 12 },
  deleteDetailBtn: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  deleteDetailText: { color: '#DC2626', fontWeight: '700', fontSize: 15 },
  closeDetailBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#E5E7EB' },
  closeDetailText: { color: '#4D92CF', fontWeight: '700', fontSize: 15 },
});
