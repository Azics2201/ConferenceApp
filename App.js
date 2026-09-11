import 'react-native-gesture-handler';
import React from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './src/context/AppContext';
import RootNavigator from './src/navigation';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  // Metro's default web template doesn't set height:100% on html/body/#root
  // the way the older webpack template used to. Without it, flex:1 scroll
  // containers (ScrollView/FlatList/SectionList) never get a bounded height
  // to scroll within, so mouse-wheel scrolling silently does nothing on
  // longer pages even though the content is there.
  document.documentElement.style.height = '100%';
  document.body.style.height = '100%';
  document.body.style.margin = '0';
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.style.height = '100%';
  }
}

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="auto" />
      <RootNavigator />
    </AppProvider>
  );
}