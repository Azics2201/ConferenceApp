import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import CheckboxRow from './CheckboxRow';
import BilingualField from './BilingualField';
import { useApp } from '../context/AppContext';
import { toBilingual, isBilingualFilled } from '../utils/bilingual';

const emptyForm = {
  title: { en: '', cs: '' },
  day: { en: '', cs: '' },
  startTime: '',
  endTime: '',
  room: { en: '', cs: '' },
  track: { en: '', cs: '' },
  description: { en: '', cs: '' },
  speakerIds: [],
};

export default function SessionEditorModal({ visible, initialSession, speakers, onCancel, onSave }) {
  const { t } = useApp();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (visible) {
      setForm(
        initialSession
          ? {
              ...emptyForm,
              ...initialSession,
              title: toBilingual(initialSession.title),
              day: toBilingual(initialSession.day),
              room: toBilingual(initialSession.room),
              track: toBilingual(initialSession.track),
              description: toBilingual(initialSession.description),
            }
          : emptyForm
      );
    }
  }, [visible, initialSession]);

  const setField = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));
  const setBilingual = (field, lang) => (value) =>
    setForm((f) => ({ ...f, [field]: { ...f[field], [lang]: value } }));

  const toggleSpeaker = (id) => {
    setForm((f) => ({
      ...f,
      speakerIds: f.speakerIds.includes(id) ? f.speakerIds.filter((s) => s !== id) : [...f.speakerIds, id],
    }));
  };

  const handleSave = () => {
    if (
      !isBilingualFilled(form.title) ||
      !isBilingualFilled(form.day) ||
      !isBilingualFilled(form.room) ||
      !isBilingualFilled(form.track) ||
      !isBilingualFilled(form.description) ||
      !form.startTime.trim()
    ) {
      return Alert.alert(t('common.bothLanguagesRequired'));
    }
    onSave(form);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView>
            <Text style={styles.title}>{initialSession ? t('sessionEditor.editTitle') : t('sessionEditor.addTitle')}</Text>

            <BilingualField
              label={t('sessionEditor.title')}
              valueEn={form.title.en}
              valueCs={form.title.cs}
              onChangeEn={setBilingual('title', 'en')}
              onChangeCs={setBilingual('title', 'cs')}
              placeholder={t('sessionEditor.titlePlaceholder')}
            />

            <BilingualField
              label={t('sessionEditor.day')}
              valueEn={form.day.en}
              valueCs={form.day.cs}
              onChangeEn={setBilingual('day', 'en')}
              onChangeCs={setBilingual('day', 'cs')}
              placeholder={t('sessionEditor.dayPlaceholder')}
            />

            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>{t('sessionEditor.start')}</Text>
                <TextInput style={styles.input} value={form.startTime} onChangeText={setField('startTime')} placeholder="09:00" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{t('sessionEditor.end')}</Text>
                <TextInput style={styles.input} value={form.endTime} onChangeText={setField('endTime')} placeholder="09:45" />
              </View>
            </View>

            <BilingualField
              label={t('sessionEditor.room')}
              valueEn={form.room.en}
              valueCs={form.room.cs}
              onChangeEn={setBilingual('room', 'en')}
              onChangeCs={setBilingual('room', 'cs')}
              placeholder={t('sessionEditor.roomPlaceholder')}
            />

            <BilingualField
              label={t('sessionEditor.track')}
              valueEn={form.track.en}
              valueCs={form.track.cs}
              onChangeEn={setBilingual('track', 'en')}
              onChangeCs={setBilingual('track', 'cs')}
              placeholder={t('sessionEditor.trackPlaceholder')}
            />

            <BilingualField
              label={t('sessionEditor.description')}
              valueEn={form.description.en}
              valueCs={form.description.cs}
              onChangeEn={setBilingual('description', 'en')}
              onChangeCs={setBilingual('description', 'cs')}
              multiline
            />

            <Text style={styles.label}>{t('sessionEditor.speakers')}</Text>
            {speakers.map((sp) => (
              <CheckboxRow
                key={sp.id}
                label={sp.name}
                checked={form.speakerIds.includes(sp.id)}
                onPress={() => toggleSpeaker(sp.id)}
              />
            ))}

            <View style={styles.actions}>
              <TouchableOpacity onPress={onCancel}>
                <Text style={styles.cancel}>{t('sessionEditor.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.save}>{t('sessionEditor.save')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  card: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '90%' },
  title: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 10, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, paddingBottom: 10 },
  cancel: { color: '#6B7280', fontWeight: '600', marginRight: 20 },
  save: { color: '#4D92CF', fontWeight: '700' },
});
