import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { EVENT } from '../data/event';
import AnnouncementCard from '../components/AnnouncementCard';
import ConfirmModal from '../components/ConfirmModal';

export default function HomeScreen({ navigation }) {
  const { currentUser, isAdminSession, announcements, logout, t } = useApp();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const confirmLogout = () => {
    setConfirmVisible(false);
    logout();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.eventName}>{EVENT.name}</Text>
      <Text style={styles.eventMeta}>{EVENT.dates} · {EVENT.location}</Text>
      <Text style={styles.tagline}>{EVENT.tagline}</Text>

      {isAdminSession ? (
        <View style={styles.adminCard}>
          <Text style={styles.adminTitle}>{t('home.adminLoggedInTitle')}</Text>
          <Text style={styles.adminSubtitle}>{t('home.adminLoggedInSubtitle')}</Text>
          <TouchableOpacity onPress={() => setConfirmVisible(true)} style={{ marginTop: 10 }}>
            <Text style={styles.logoutText}>{t('home.logout')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.regCard}>
          <Text style={styles.regTitle}>{t('home.registeredTitle')}</Text>
          <Text style={styles.regText}>{currentUser.firstName} {currentUser.lastName} · {currentUser.email}</Text>
          {currentUser.isSubAdmin && (
            <Text style={styles.subAdminNote}>{t('home.subAdminNote')}</Text>
          )}
          <TouchableOpacity style={styles.badgeBtn} onPress={() => navigation.navigate('Badge')}>
            <Text style={styles.badgeBtnText}>{t('home.viewBadge')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setConfirmVisible(true)} style={{ marginTop: 10 }}>
            <Text style={styles.logoutText}>{t('home.logout')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.quickLinks}>
        <QuickLink label={t('home.program')} onPress={() => navigation.navigate('ProgramTab')} />
        <QuickLink label={t('home.speakers')} onPress={() => navigation.navigate('SpeakersTab')} />
        <QuickLink label={t('home.venueInfo')} onPress={() => navigation.navigate('InfoTab')} />
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeader}>{t('home.latestAnnouncements')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AnnouncementsTab')}>
          <Text style={styles.seeAll}>{t('home.seeAll')}</Text>
        </TouchableOpacity>
      </View>
      {announcements.slice(0, 2).map((a) => (
        <AnnouncementCard key={a.id} announcement={a} onPress={() => navigation.navigate('AnnouncementsTab')} />
      ))}

      <ConfirmModal
        visible={confirmVisible}
        title={t('home.logoutConfirmTitle')}
        body={t('home.logoutConfirmBody')}
        confirmLabel={t('home.logout')}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={confirmLogout}
      />
    </ScrollView>
  );
}

function QuickLink({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.quickLink} onPress={onPress}>
      <Text style={styles.quickLinkText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  eventName: { fontSize: 24, fontWeight: '800', color: '#111827' },
  eventMeta: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  tagline: { fontSize: 14, color: '#374151', marginTop: 8, marginBottom: 16 },
  regCard: { backgroundColor: '#ECFDF5', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#A7F3D0' },
  regTitle: { fontWeight: '700', color: '#065F46' },
  regText: { color: '#047857', marginTop: 4, fontSize: 12 },
  subAdminNote: { color: '#4F5D1B', fontSize: 11, marginTop: 6, fontWeight: '600' },
  badgeBtn: { backgroundColor: '#059669', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, alignSelf: 'flex-start', marginTop: 10 },
  badgeBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  adminCard: { backgroundColor: '#E4EFF8', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#AFCEE9' },
  adminTitle: { fontWeight: '700', color: '#4F5D1B' },
  adminSubtitle: { fontSize: 12, color: '#4F5D1B', marginTop: 4 },
  logoutText: { color: '#DC2626', fontSize: 12, fontWeight: '600' },
  quickLinks: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  quickLink: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, marginRight: 8, marginBottom: 8 },
  quickLinkText: { color: '#1F2937', fontWeight: '600', fontSize: 13 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#111827' },
  seeAll: { color: '#4D92CF', fontSize: 13, fontWeight: '600' },
});
