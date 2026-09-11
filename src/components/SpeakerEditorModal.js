import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';

const emptyForm = { name: '', title: '', bio: '', photo: '' };

export default function SpeakerEditorModal({ visible, initialSpeaker, onCancel, onSave }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (visible) setForm(initialSpeaker ? { ...emptyForm, ...initialSpeaker } : emptyForm);
  }, [visible, initialSpeaker]);

  const setField = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    const photo = form.photo.trim() || 'https://i.pravatar.cc/150';
    onSave({ ...form, photo });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView>
            <Text style={styles.title}>{initialSpeaker ? 'Edit speaker' : 'Add speaker'}</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} value={form.name} onChangeText={setField('name')} placeholder="Full name" />

            <Text style={styles.label}>Title / role</Text>
            <TextInput style={styles.input} value={form.title} onChangeText={setField('title')} placeholder="e.g. VP Engineering, Acme" />

            <Text style={styles.label}>Bio</Text>
            <TextInput style={[styles.input, styles.multiline]} value={form.bio} onChangeText={setField('bio')} multiline />

            <Text style={styles.label}>Photo URL (optional)</Text>
            <TextInput style={styles.input} value={form.photo} onChangeText={setField('photo')} placeholder="https://..." autoCapitalize="none" />

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
  save: { color: '#4D92CF', fontWeight: '700' },
});
