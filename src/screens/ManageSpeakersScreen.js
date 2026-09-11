import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import SpeakerEditorModal from '../components/SpeakerEditorModal';
import ConfirmModal from '../components/ConfirmModal';

export default function ManageSpeakersScreen() {
  const { hasAdminAccess, speakers, addSpeaker, updateSpeaker, deleteSpeaker } = useApp();
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openAdd = () => {
    setEditingSpeaker(null);
    setEditorVisible(true);
  };

  const openEdit = (speaker) => {
    setEditingSpeaker(speaker);
    setEditorVisible(true);
  };

  const handleSave = (form) => {
    if (editingSpeaker) {
      updateSpeaker(editingSpeaker.id, form);
    } else {
      addSpeaker(form);
    }
    setEditorVisible(false);
  };

  const confirmDelete = () => {
    if (deleteTarget) deleteSpeaker(deleteTarget.id);
    setDeleteTarget(null);
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
        data={speakers}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <Text style={styles.addBtnText}>+ Add speaker</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={{ uri: item.photo }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.name}</Text>
              <Text style={styles.rowMeta}>{item.title}</Text>
            </View>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
              <Ionicons name="create-outline" size={20} color="#4F46E5" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeleteTarget(item)} style={styles.iconBtn}>
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
            </TouchableOpacity>
          </View>
        )}
      />

      <SpeakerEditorModal
        visible={editorVisible}
        initialSpeaker={editingSpeaker}
        onCancel={() => setEditorVisible(false)}
        onSave={handleSave}
      />

      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete speaker"
        body={deleteTarget ? `Remove "${deleteTarget.name}"?` : ''}
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  restricted: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  restrictedText: { fontSize: 14, color: '#DC2626', textAlign: 'center' },
  addBtn: { backgroundColor: '#4F46E5', borderRadius: 10, padding: 12, marginBottom: 14, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: '#E5E7EB' },
  rowTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  rowMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  iconBtn: { padding: 6, marginLeft: 4 },
});
