import React, { useMemo } from 'react';
import { SectionList, Text, StyleSheet } from 'react-native';
import SessionCard from '../components/SessionCard';
import { useApp } from '../context/AppContext';

export default function ProgramScreen({ navigation }) {
  const { sessions, favorites, toggleFavorite } = useApp();

  const sections = useMemo(() => {
    const days = [...new Set(sessions.map((s) => s.day))];
    return days.map((day) => ({ title: day, data: sessions.filter((s) => s.day === day) }));
  }, [sessions]);

  return (
    <SectionList
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
      sections={sections}
      keyExtractor={(item) => item.id}
      renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
      renderItem={({ item }) => (
        <SessionCard
          session={item}
          isFavorite={favorites.includes(item.id)}
          onToggleFavorite={() => toggleFavorite(item.id)}
          onPress={() => navigation.navigate('SessionDetail', { sessionId: item.id })}
        />
      )}
      stickySectionHeadersEnabled
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  sectionHeader: { fontSize: 15, fontWeight: '800', color: '#111827', backgroundColor: '#F3F4F6', paddingVertical: 8 },
});
