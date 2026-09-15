import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import BilingualField from './BilingualField';
import { useApp } from '../context/AppContext';
import { toBilingual, isBilingualFilled } from '../utils/bilingual';

const emptyForm = { title: { en: '', cs: '' }, url: '' };

export default function MaterialEditorModal({ visible, initialMaterial, onCancel, onSave }) {
  const { t } = useApp();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (visible) {
      setForm(
        initialMaterial
          ? { ...emptyForm, ...initialMaterial, title: toBilingual(initialMaterial.title) }
          : emptyForm
      );
    }
  }, [visible, initialMaterial]);

  const setField = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));
  const setBilingual = (field, lang) => (value) =>
    setForm((f) => ({ ...f, [field]: { ...f[field], [lang]: value } }));

  const handleSave = () => {
    if (!isBilingualFilled(form.title) || !form.url.trim()) {
      return Alert.alert(t('common.bothLanguagesRequired'));
    }
    onSave(form);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView>
            <Text style={styles.title}>{initialMaterial ? t('materialEditor.editTitle') : t('materialEditor.addTitle')}</Text>

            <BilingualField
              label={t('materialEditor.title')}
              valueEn={form.title.en}
              valueCs={form.title.cs}
              onChangeEn={setBilingual('title', 'en')}
              onChangeCs={setBilingual('title', 'cs')}
              placeholder={t('materialEditor.titlePlaceholder')}
            />

            <Text style={styles.label}>{t('materialEditor.url')}</Text>
            <TextInput
              style={styles.input}
              value={form.url}
              onChangeText={setField('url')}
              placeholder="https://..."
              autoCapitalize="none"
              keyboardType="url"
            />

            <View style={styles.actions}>
              <TouchableOpacity onPress={onCancel}>
                <Text style={styles.cancel}>{t('materialEditor.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.save}>{t('materialEditor.save')}</Text>
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
