import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import SpeakerCard from '../components/SpeakerCard';
import { useApp } from '../context/AppContext';

export default function SpeakersScreen({ navigation }) {
  const { speakers } = useApp();
  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
      data={speakers}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <SpeakerCard speaker={item} onPress={() => navigation.navigate('SpeakerDetail', { speakerId: item.id })} />
      )}
    />
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F3F4F6' } });
