import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

export default function ConfirmModal({
  visible,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = true,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {!!body && <Text style={styles.body}>{body}</Text>}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={[styles.confirmBtn, destructive && styles.confirmBtnDestructive]}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', maxWidth: 340 },
  title: { fontSize: 16, fontWeight: '800', color: '#111827' },
  body: { fontSize: 13, color: '#6B7280', marginTop: 8, lineHeight: 18 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  cancelBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  cancelText: { color: '#6B7280', fontWeight: '600', fontSize: 14 },
  confirmBtn: { backgroundColor: '#4F46E5', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, marginLeft: 8 },
  confirmBtnDestructive: { backgroundColor: '#DC2626' },
  confirmText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
