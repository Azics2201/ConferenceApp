import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import CheckboxRow from './CheckboxRow';

const emptyForm = { title: '', day: '', startTime: '', endTime: '', room: '', track: '', description: '', speakerIds: [] };

export default function SessionEditorModal({ visible, initialSession, speakers, onCancel, onSave }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (visible) setForm(initialSession ? { ...emptyForm, ...initialSession } : emptyForm);
  }, [visible, initialSession]);

  const setField = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleSpeaker = (id) => {
    setForm((f) => ({
      ...f,
      speakerIds: f.speakerIds.includes(id) ? f.speakerIds.filter((s) => s !== id) : [...f.speakerIds, id],
    }));
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.day.trim() || !form.startTime.trim()) return;
    onSave(form);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView>
            <Text style={styles.title}>{initialSession ? 'Edit session' : 'Add session'}</Text>

            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} value={form.title} onChangeText={setField('title')} placeholder="Session title" />

            <Text style={styles.label}>Day (e.g. "Day 1 — Oct 14")</Text>
            <TextInput style={styles.input} value={form.day} onChangeText={setField('day')} placeholder="Day 1 — Oct 14" />

            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Start</Text>
                <TextInput style={styles.input} value={form.startTime} onChangeText={setField('startTime')} placeholder="09:00" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>End</Text>
                <TextInput style={styles.input} value={form.endTime} onChangeText={setField('endTime')} placeholder="09:45" />
              </View>
            </View>

            <Text style={styles.label}>Room</Text>
            <TextInput style={styles.input} value={form.room} onChangeText={setField('room')} placeholder="Main Hall" />

            <Text style={styles.label}>Track</Text>
            <TextInput style={styles.input} value={form.track} onChangeText={setField('track')} placeholder="Engineering" />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={form.description}
              onChangeText={setField('description')}
              multiline
            />

            <Text style={styles.label}>Speakers</Text>
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
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.save}>Save</Text>
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
  multiline: { height: 70, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, paddingBottom: 10 },
  cancel: { color: '#6B7280', fontWeight: '600', marginRight: 20 },
  save: { color: '#4F46E5', fontWeight: '700' },
});
