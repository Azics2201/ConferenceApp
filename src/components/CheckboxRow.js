import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CheckboxRow({ label, checked, onPress, style }) {
  return (
    <TouchableOpacity style={[styles.row, style]} onPress={onPress} activeOpacity={0.7}>
      <Ionicons
        name={checked ? 'checkbox' : 'square-outline'}
        size={22}
        color={checked ? '#4F46E5' : '#9CA3AF'}
      />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  label: { marginLeft: 10, fontSize: 14, color: '#1F2937', flex: 1 },
});
