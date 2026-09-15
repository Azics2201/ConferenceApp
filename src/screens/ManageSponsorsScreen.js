import React, { useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import SponsorEditorModal from '../components/SponsorEditorModal';
import ConfirmModal from '../components/ConfirmModal';

export default function ManageSponsorsScreen() {
  const { hasAdminAccess, sponsors, addSponsor, updateSponsor, deleteSponsor, t } = useApp();
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openAdd = () => {
    setEditingSponsor(null);
    setEditorVisible(true);
  };

  const openEdit = (sponsor) => {
    setEditingSponsor(sponsor);
    setEditorVisible(true);
  };

  const handleSave = (form) => {
    if (editingSponsor) {
      updateSponsor(editingSponsor.id, form);
    } else {
      addSponsor(form);
    }
    setEditorVisible(false);
  };

  const confirmDelete = () => {
    if (deleteTarget) deleteSponsor(deleteTarget.id);
    setDeleteTarget(null);
  };

  if (!hasAdminAccess) {
    return (
      <View style={styles.restricted}>
        <Text style={styles.restrictedText}>{t('manageSponsors.restricted')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={sponsors}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
              <Text style={styles.addBtnText}>{t('manageSponsors.addSponsor')}</Text>
            </TouchableOpacity>
            <Text style={styles.note}>{t('manageSponsors.note')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={[styles.swatch, { backgroundColor: item.color }]}>
              {!!item.image && <Image source={{ uri: item.image }} style={styles.swatchImage} resizeMode="contain" />}
            </View>
            <Text style={styles.rowTitle}>{item.name}</Text>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
              <Ionicons name="create-outline" size={20} color="#4D92CF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeleteTarget(item)} style={styles.iconBtn}>
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
            </TouchableOpacity>
          </View>
        )}
      />

      <SponsorEditorModal
        visible={editorVisible}
        initialSponsor={editingSponsor}
        onCancel={() => setEditorVisible(false)}
        onSave={handleSave}
      />

      <ConfirmModal
        visible={!!deleteTarget}
        title={t('manageSponsors.deleteTitle')}
        body={deleteTarget ? t('manageSponsors.deleteBody', { name: deleteTarget.name }) : ''}
        confirmLabel={t('manageSponsors.deleteLabel')}
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
  addBtn: { backgroundColor: '#4D92CF', borderRadius: 10, padding: 12, marginBottom: 8, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  note: { fontSize: 12, color: '#6B7280', marginBottom: 14, lineHeight: 17 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8 },
  swatch: { width: 28, height: 28, borderRadius: 8, marginRight: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  swatchImage: { width: '100%', height: '100%' },
  rowTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1F2937' },
  iconBtn: { padding: 6, marginLeft: 4 },
});
