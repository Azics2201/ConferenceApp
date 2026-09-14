import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { LANGUAGES } from '../i18n';

// A small floating pill, not an overlay that could cover screen content —
// it only ever expands into its own bottom-sheet modal when tapped, the
// same pattern used by every other picker in this app (Session/Speaker/
// Participant editors), so it stays consistent and never blocks the UI
// underneath it.
export default function LanguageButton() {
  const { language, setLanguage, t } = useApp();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <>
      <TouchableOpacity
        style={[styles.button, { top: insets.top + 8 }]}
        onPress={() => setVisible(true)}
        accessibilityLabel={t('languagePicker.button')}
      >
        <Text style={styles.flag}>{current.flag}</Text>
        <Text style={styles.code}>{current.code.toUpperCase()}</Text>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.title}>{t('languagePicker.title')}</Text>
            {LANGUAGES.map((item) => (
              <TouchableOpacity
                key={item.code}
                style={[styles.row, item.code === language && styles.rowActive]}
                onPress={() => {
                  setLanguage(item.code);
                  setVisible(false);
                }}
              >
                <Text style={styles.rowFlag}>{item.flag}</Text>
                <Text style={styles.rowLabel}>{item.nativeName}</Text>
                {item.code === language && (
                  <Ionicons name="checkmark" size={18} color="#4D92CF" style={{ marginLeft: 'auto' }} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setVisible(false)}>
              <Text style={styles.closeBtnText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 12,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17,24,39,0.85)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  flag: { fontSize: 15, marginRight: 5 },
  code: { color: '#fff', fontWeight: '700', fontSize: 12 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  card: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, paddingBottom: 10 },
  title: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 10 },
  rowActive: { backgroundColor: '#E4EFF8' },
  rowFlag: { fontSize: 20, marginRight: 12 },
  rowLabel: { fontSize: 15, color: '#1F2937', fontWeight: '600' },
  closeBtn: { paddingVertical: 14, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E5E7EB', marginTop: 10 },
  closeBtnText: { color: '#4D92CF', fontWeight: '700', fontSize: 15 },
});
