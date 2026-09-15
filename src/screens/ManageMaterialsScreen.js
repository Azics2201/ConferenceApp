import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import MaterialEditorModal from '../components/MaterialEditorModal';
import ConfirmModal from '../components/ConfirmModal';

export default function ManageMaterialsScreen() {
  const { hasAdminAccess, materials, addMaterial, updateMaterial, deleteMaterial, t, localize } = useApp();
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openAdd = () => {
    setEditingMaterial(null);
    setEditorVisible(true);
  };

  const openEdit = (material) => {
    setEditingMaterial(material);
    setEditorVisible(true);
  };

  const handleSave = (form) => {
    if (editingMaterial) {
      updateMaterial(editingMaterial.id, form);
    } else {
      addMaterial(form);
    }
    setEditorVisible(false);
  };

  const confirmDelete = () => {
    if (deleteTarget) deleteMaterial(deleteTarget.id);
    setDeleteTarget(null);
  };

  if (!hasAdminAccess) {
    return (
      <View style={styles.restricted}>
        <Text style={styles.restrictedText}>{t('manageMaterials.restricted')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={materials}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <Text style={styles.addBtnText}>{t('manageMaterials.addMaterial')}</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Ionicons name="document-text-outline" size={20} color="#4D92CF" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.rowTitle}>{localize(item.title)}</Text>
              <Text style={styles.rowMeta} numberOfLines={1}>{item.url}</Text>
            </View>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
              <Ionicons name="create-outline" size={20} color="#4D92CF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeleteTarget(item)} style={styles.iconBtn}>
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
            </TouchableOpacity>
          </View>
        )}
      />

      <MaterialEditorModal
        visible={editorVisible}
        initialMaterial={editingMaterial}
        onCancel={() => setEditorVisible(false)}
        onSave={handleSave}
      />

      <ConfirmModal
        visible={!!deleteTarget}
        title={t('manageMaterials.deleteTitle')}
        body={deleteTarget ? t('manageMaterials.deleteBody', { title: localize(deleteTarget.title) }) : ''}
        confirmLabel={t('manageMaterials.deleteLabel')}
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
  addBtn: { backgroundColor: '#4D92CF', borderRadius: 10, padding: 12, marginBottom: 14, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  rowMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  iconBtn: { padding: 6, marginLeft: 4 },
});
