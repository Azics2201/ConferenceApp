import 'react-native-gesture-handler';
import React from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import RootNavigator from './src/navigation';
import SponsorBanner from './src/components/SponsorBanner';

// Below this viewport width there isn't room for two 110px sidebars plus
// content without squeezing the app itself, so the side banners only show
// on wide web viewports; they're never absolutely positioned over content.
const MIN_WIDTH_FOR_SIDE_BANNERS = 900;

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

function AppShell() {
  const { width } = useWindowDimensions();

  if (Platform.OS === 'web') {
    const showSideBanners = width >= MIN_WIDTH_FOR_SIDE_BANNERS;
    return (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {showSideBanners && <SponsorBanner orientation="vertical" />}
        <View style={{ flex: 1, minWidth: 0 }}>
          <RootNavigator />
        </View>
        {showSideBanners && <SponsorBanner orientation="vertical" />}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SponsorBanner orientation="horizontal" />
      <View style={{ flex: 1 }}>
        <RootNavigator />
      </View>
    </View>
  );
}

export default function App() {
  return (
    <AppProvider>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AppShell />
      </SafeAreaProvider>
    </AppProvider>
  );
}