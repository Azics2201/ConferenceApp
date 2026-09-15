import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import AdminLoginScreen from '../screens/AdminLoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RegistrationConfirmationScreen from '../screens/RegistrationConfirmationScreen';

import HomeScreen from '../screens/HomeScreen';
import BadgeScreen from '../screens/BadgeScreen';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import ManageParticipantsScreen from '../screens/ManageParticipantsScreen';
import ManageProgramScreen from '../screens/ManageProgramScreen';
import ManageSpeakersScreen from '../screens/ManageSpeakersScreen';
import ManageOrgInfoScreen from '../screens/ManageOrgInfoScreen';
import ManageAnnouncementsScreen from '../screens/ManageAnnouncementsScreen';
import ManageEventScreen from '../screens/ManageEventScreen';
import ManageMaterialsScreen from '../screens/ManageMaterialsScreen';
import ManageSponsorsScreen from '../screens/ManageSponsorsScreen';
import CheckInScannerScreen from '../screens/CheckInScannerScreen';
import ProgramScreen from '../screens/ProgramScreen';
import SessionDetailScreen from '../screens/SessionDetailScreen';
import SpeakersScreen from '../screens/SpeakersScreen';
import SpeakerDetailScreen from '../screens/SpeakerDetailScreen';
import InfoScreen from '../screens/InfoScreen';
import AnnouncementsScreen from '../screens/AnnouncementsScreen';

const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();
const HomeStack = createStackNavigator();
const AdminStack = createStackNavigator();
const ProgramStack = createStackNavigator();
const SpeakersStack = createStackNavigator();

// @react-navigation/stack wraps each screen in a transition "card" container
// that, on web, doesn't reliably inherit a bounded height from its parent —
// which silently breaks ScrollView/FlatList scrolling inside it (the content
// gets clipped instead of scrolling). Forcing the card itself to flex:1 fixes
// this for every screen in every stack below, not just one at a time.
const stackScreenOptions = { cardStyle: { flex: 1 } };

function AuthStackNavigator() {
  const { t } = useApp();
  return (
    <AuthStack.Navigator screenOptions={stackScreenOptions}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="Register" component={RegisterScreen} options={{ title: t('nav.register') }} />
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: t('nav.login') }} />
      <AuthStack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ title: t('nav.adminLogin') }} />
      <AuthStack.Screen
        name="RegistrationConfirmation"
        component={RegistrationConfirmationScreen}
        options={{ title: t('nav.registered'), headerLeft: () => null, gestureEnabled: false }}
      />
    </AuthStack.Navigator>
  );
}

function HomeStackNavigator() {
  const { t, event } = useApp();
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: event.name }} />
      <HomeStack.Screen name="Badge" component={BadgeScreen} options={{ title: t('nav.myBadge') }} />
    </HomeStack.Navigator>
  );
}

function AdminStackNavigator() {
  const { t } = useApp();
  return (
    <AdminStack.Navigator screenOptions={stackScreenOptions}>
      <AdminStack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: t('nav.organizerTools') }} />
      <AdminStack.Screen name="ManageEvent" component={ManageEventScreen} options={{ title: t('nav.manageEvent') }} />
      <AdminStack.Screen name="ManageParticipants" component={ManageParticipantsScreen} options={{ title: t('nav.manageParticipants') }} />
      <AdminStack.Screen name="ManageProgram" component={ManageProgramScreen} options={{ title: t('nav.manageProgram') }} />
      <AdminStack.Screen name="ManageSpeakers" component={ManageSpeakersScreen} options={{ title: t('nav.manageSpeakers') }} />
      <AdminStack.Screen name="ManageOrgInfo" component={ManageOrgInfoScreen} options={{ title: t('nav.manageOrgInfo') }} />
      <AdminStack.Screen name="ManageMaterials" component={ManageMaterialsScreen} options={{ title: t('nav.manageMaterials') }} />
      <AdminStack.Screen name="ManageSponsors" component={ManageSponsorsScreen} options={{ title: t('nav.manageSponsors') }} />
      <AdminStack.Screen name="ManageAnnouncements" component={ManageAnnouncementsScreen} options={{ title: t('nav.announcements') }} />
      <AdminStack.Screen name="CheckInScanner" component={CheckInScannerScreen} options={{ title: t('nav.checkInScanner') }} />
    </AdminStack.Navigator>
  );
}

function ProgramStackNavigator() {
  const { t } = useApp();
  return (
    <ProgramStack.Navigator screenOptions={stackScreenOptions}>
      <ProgramStack.Screen name="Program" component={ProgramScreen} options={{ title: t('nav.program') }} />
      <ProgramStack.Screen name="SessionDetail" component={SessionDetailScreen} options={{ title: t('nav.session') }} />
    </ProgramStack.Navigator>
  );
}

function SpeakersStackNavigator() {
  const { t } = useApp();
  return (
    <SpeakersStack.Navigator screenOptions={stackScreenOptions}>
      <SpeakersStack.Screen name="Speakers" component={SpeakersScreen} options={{ title: t('nav.speakers') }} />
      <SpeakersStack.Screen name="SpeakerDetail" component={SpeakerDetailScreen} options={{ title: t('nav.speaker') }} />
    </SpeakersStack.Navigator>
  );
}

const ICONS = {
  HomeTab: 'home-outline',
  ProgramTab: 'calendar-outline',
  SpeakersTab: 'people-outline',
  InfoTab: 'information-circle-outline',
  AnnouncementsTab: 'megaphone-outline',
  AdminTab: 'shield-checkmark-outline',
};

function MainTabs() {
  const { hasAdminAccess, t } = useApp();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => <Ionicons name={ICONS[route.name]} color={color} size={size} />,
        tabBarActiveTintColor: '#4D92CF',
        tabBarInactiveTintColor: '#9CA3AF',
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: t('nav.home') }} />
      <Tab.Screen name="ProgramTab" component={ProgramStackNavigator} options={{ title: t('nav.program') }} />
      <Tab.Screen name="SpeakersTab" component={SpeakersStackNavigator} options={{ title: t('nav.speakers') }} />
      <Tab.Screen name="InfoTab" component={InfoScreen} options={{ title: t('nav.info'), headerShown: true }} />
      <Tab.Screen name="AnnouncementsTab" component={AnnouncementsScreen} options={{ title: t('nav.updates'), headerShown: true }} />
      {hasAdminAccess && (
        <Tab.Screen name="AdminTab" component={AdminStackNavigator} options={{ title: t('nav.admin') }} />
      )}
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, loading } = useApp();

  if (loading) return null;

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
}
