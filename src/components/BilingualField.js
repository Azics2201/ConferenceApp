import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';

// Renders one label with two text inputs side by side — English and Czech —
// so every piece of admin-authored content is written in both languages up
// front, rather than being typed once and silently staying single-language.
// `flexBasis` on each column plus `flexWrap` on the row makes the two boxes
// stack on narrow (phone-width) screens instead of squeezing unreadably.
export default function BilingualField({
  label,
  valueEn,
  valueCs,
  onChangeEn,
  onChangeCs,
  placeholder,
  multiline,
  tall,
}) {
  const { t } = useApp();
  return (
    <View style={styles.wrap}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.langTag}>{t('bilingualField.en')}</Text>
          <TextInput
            style={[styles.input, multiline && styles.multiline, tall && styles.tall]}
            value={valueEn}
            onChangeText={onChangeEn}
            placeholder={placeholder}
            multiline={multiline}
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.langTag}>{t('bilingualField.cs')}</Text>
          <TextInput
            style={[styles.input, multiline && styles.multiline, tall && styles.tall]}
            value={valueCs}
            onChangeText={onChangeCs}
            placeholder={placeholder}
            multiline={multiline}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  col: { flexGrow: 1, flexBasis: 140 },
  langTag: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', marginBottom: 4, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  tall: { minHeight: 180 },
});
