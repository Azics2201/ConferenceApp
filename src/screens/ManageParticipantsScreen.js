import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import ConfirmModal from '../components/ConfirmModal';
import ParticipantEditorModal from '../components/ParticipantEditorModal';
import { exportParticipantsLocally } from '../utils/export';

const ROLE_FILTERS = ['All', 'Attendee', 'Speaker', 'Press', 'Organizer'];

export default function ManageParticipantsScreen() {
  const { hasAdminAccess, accounts, sessions, deleteAccount, registerAccount, updateAccount } = useApp();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [formError, setFormError] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accounts.filter((a) => {
      const matchesRole = roleFilter === 'All' || a.role === roleFilter;
      if (!matchesRole) return false;
      if (!q) return true;
      const haystack = `${a.firstName} ${a.lastName} ${a.email} ${a.organization || ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [accounts, query, roleFilter]);

  const sessionTitleById = useMemo(() => Object.fromEntries(sessions.map((s) => [s.id, s.title])), [sessions]);

  const confirmDelete = () => {
    if (deleteTarget) deleteAccount(deleteTarget.email);
    setDeleteTarget(null);
  };

  const onExport = async () => {
    setExporting(true);
    setExportMessage('');
    const result = await exportParticipantsLocally(filtered, sessions, 'participants.csv');
    setExporting(false);
    setExportMessage(result.success ? `Exported ${filtered.length} participant(s).` : `Export failed: ${result.error}`);
  };

  const openAdd = () => {
    setEditingAccount(null);
    setFormError('');
    setEditorVisible(true);
  };

  const openEdit = (account) => {
    setEditingAccount(account);
    setFormError('');
    setEditorVisible(true);
  };

  const handleSave = async (form) => {
    setFormError('');
    if (editingAccount) {
      const result = await updateAccount(editingAccount.email, form);
      if (!result.success) return setFormError(result.error);
    } else {
      const result = await registerAccount({ ...form, termsAcceptedAt: null });
      if (!result.success) return setFormError(result.error);
    }
    setEditorVisible(false);
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
        data={filtered}
        keyExtractor={(item) => item.participantId}
        ListHeaderComponent={
          <View>
            <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
              <Text style={styles.addBtnText}>+ Add person</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.search}
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name, email, or organization"
            />
            <View style={styles.chipRow}>
              {ROLE_FILTERS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, roleFilter === r && styles.chipActive]}
                  onPress={() => setRoleFilter(r)}
                >
                  <Text style={[styles.chipText, roleFilter === r && styles.chipTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>
                {filtered.length} of {accounts.length} participant{accounts.length === 1 ? '' : 's'}
              </Text>
              <TouchableOpacity style={styles.exportBtn} onPress={onExport} disabled={exporting || filtered.length === 0}>
                <Ionicons name="download-outline" size={14} color="#fff" />
                <Text style={styles.exportBtnText}>{exporting ? 'Exporting…' : 'Export CSV'}</Text>
              </TouchableOpacity>
            </View>
            {!!exportMessage && <Text style={styles.exportMessage}>{exportMessage}</Text>}

            {accounts.length === 0 && (
              <Text style={styles.emptyNote}>
                No participants yet. Registrations made on this device — including from earlier versions of the
                app you tested — will show up here.
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const mySessions = (item.sessionIds || []).map((id) => sessionTitleById[id]).filter(Boolean);
          return (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.rowName}>{item.firstName} {item.lastName}</Text>
                  {item.isSubAdmin && (
                    <View style={styles.subAdminBadge}>
                      <Text style={styles.subAdminBadgeText}>Sub-admin</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.rowMeta}>{item.email}</Text>
                <Text style={styles.rowMeta}>
                  {item.organization}{item.organization ? ' · ' : ''}{item.role}
                </Text>
                <Text style={styles.rowDate}>Registered {new Date(item.registeredAt).toLocaleDateString()}</Text>
                <Text style={styles.sessionsLabel}>
                  {mySessions.length > 0 ? `Sessions: ${mySessions.join(', ')}` : 'No sessions selected'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
                <Ionicons name="create-outline" size={20} color="#4D92CF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDeleteTarget(item)} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={20} color="#DC2626" />
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <ParticipantEditorModal
        visible={editorVisible}
        initialAccount={editingAccount}
        sessions={sessions}
        error={formError}
        onCancel={() => setEditorVisible(false)}
        onSave={handleSave}
      />

      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete participant"
        body={deleteTarget ? `Remove "${deleteTarget.firstName} ${deleteTarget.lastName}" (${deleteTarget.email})? This cannot be undone.` : ''}
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
  addBtn: { backgroundColor: '#4D92CF', borderRadius: 10, padding: 12, marginBottom: 12, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  search: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: '#fff', marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#fff', marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  chipActive: { backgroundColor: '#4D92CF', borderColor: '#4D92CF' },
  chipText: { fontSize: 12, color: '#374151' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  summaryText: { fontSize: 12, color: '#6B7280' },
  exportBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4D92CF', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  exportBtnText: { color: '#fff', fontSize: 12, fontWeight: '700', marginLeft: 6 },
  exportMessage: { fontSize: 12, color: '#059669', marginBottom: 10 },
  emptyNote: { fontSize: 12, color: '#9CA3AF', marginTop: 10, lineHeight: 17 },
  row: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  rowName: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  subAdminBadge: { backgroundColor: '#E4EFF8', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 8 },
  subAdminBadgeText: { fontSize: 10, color: '#4F5D1B', fontWeight: '700' },
  rowMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  rowDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  sessionsLabel: { fontSize: 11, color: '#4D92CF', marginTop: 4, lineHeight: 15 },
  iconBtn: { padding: 6, marginLeft: 4 },
});
