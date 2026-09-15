import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SESSIONS as SEED_SESSIONS } from '../data/sessions';
import { SPEAKERS as SEED_SPEAKERS } from '../data/speakers';
import { ORG_INFO as SEED_ORG_INFO } from '../data/orgInfo';
import { INITIAL_ANNOUNCEMENTS } from '../data/announcements';
import { EVENT as SEED_EVENT } from '../data/event';
import { MATERIALS as SEED_MATERIALS } from '../data/materials';
import { SPONSORS as SEED_SPONSORS } from '../data/sponsors';
import { TERMS_TEXT as SEED_TERMS_TEXT } from '../data/terms';
import { scheduleLocalNotification } from '../utils/notifications';
import { generateId } from '../utils/id';
import { DEFAULT_LANGUAGE, translate, localizeField } from '../i18n';

const STORAGE_KEYS = {
  ACCOUNTS: '@conference/accounts',
  SESSION: '@conference/session', // { role: 'participant', email } | { role: 'admin' } | null
  FAVORITES: '@conference/favorites',
  ANNOUNCEMENTS: '@conference/announcements',
  SESSIONS: '@conference/sessions',
  SPEAKERS: '@conference/speakers',
  ORG_INFO: '@conference/org-info',
  CHECK_INS: '@conference/check-ins',
  LANGUAGE: '@conference/language',
  EVENT: '@conference/event',
  MATERIALS: '@conference/materials',
  SPONSORS: '@conference/sponsors',
  TERMS_TEXT: '@conference/terms-text',
};

// Hardcoded for this prototype only — a real app would never ship credentials
// in client code. Replace with real authentication against a backend.
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [session, setSession] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [sessions, setSessions] = useState(SEED_SESSIONS);
  const [speakers, setSpeakers] = useState(SEED_SPEAKERS);
  const [orgInfo, setOrgInfo] = useState(SEED_ORG_INFO);
  const [checkIns, setCheckIns] = useState([]);
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [event, setEvent] = useState(SEED_EVENT);
  const [materials, setMaterials] = useState(SEED_MATERIALS);
  const [sponsors, setSponsors] = useState(SEED_SPONSORS);
  const [termsText, setTermsText] = useState(SEED_TERMS_TEXT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const entries = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.ACCOUNTS),
          AsyncStorage.getItem(STORAGE_KEYS.SESSION),
          AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
          AsyncStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS),
          AsyncStorage.getItem(STORAGE_KEYS.SESSIONS),
          AsyncStorage.getItem(STORAGE_KEYS.SPEAKERS),
          AsyncStorage.getItem(STORAGE_KEYS.ORG_INFO),
          AsyncStorage.getItem(STORAGE_KEYS.CHECK_INS),
          AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
          AsyncStorage.getItem(STORAGE_KEYS.EVENT),
          AsyncStorage.getItem(STORAGE_KEYS.MATERIALS),
          AsyncStorage.getItem(STORAGE_KEYS.SPONSORS),
          AsyncStorage.getItem(STORAGE_KEYS.TERMS_TEXT),
        ]);
        const [
          accRaw, sessRaw, favRaw, annRaw, sesRaw, spkRaw, orgRaw, chkRaw, langRaw,
          eventRaw, matRaw, sponRaw, termsRaw,
        ] = entries;
        if (accRaw) setAccounts(JSON.parse(accRaw));
        if (sessRaw) setSession(JSON.parse(sessRaw));
        if (favRaw) setFavorites(JSON.parse(favRaw));
        if (annRaw) setAnnouncements(JSON.parse(annRaw));
        if (sesRaw) setSessions(JSON.parse(sesRaw));
        if (spkRaw) setSpeakers(JSON.parse(spkRaw));
        if (orgRaw) setOrgInfo(JSON.parse(orgRaw));
        if (chkRaw) setCheckIns(JSON.parse(chkRaw));
        if (langRaw) setLanguageState(langRaw);
        if (eventRaw) setEvent(JSON.parse(eventRaw));
        if (matRaw) setMaterials(JSON.parse(matRaw));
        if (sponRaw) setSponsors(JSON.parse(sponRaw));
        if (termsRaw) setTermsText(JSON.parse(termsRaw));
      } catch (e) {
        console.warn('Failed to load stored data', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const normalizeEmail = (email) => email.trim().toLowerCase();

  const t = (key, vars) => translate(language, key, vars);
  const localize = (field) => localizeField(field, language);

  const setLanguage = async (code) => {
    setLanguageState(code);
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, code);
  };

  // Derived early so every mutation below can enforce it — this is what
  // actually stops an unauthorized user from calling an admin action, not
  // just the UI hiding the button for it. The shared admin/admin login only
  // ever works on web (see loginAdmin below). A participant account can also
  // carry isSubAdmin (granted by a full admin) to get the same access
  // without using that shared login — e.g. organizers who need to check
  // people in from a phone via the camera scanner, so sub-admin access is
  // intentionally NOT restricted to web the way the shared login is.
  const currentUser =
    session && session.role === 'participant'
      ? accounts.find((a) => normalizeEmail(a.email) === normalizeEmail(session.email)) || null
      : null;
  const isAdminSession = !!session && session.role === 'admin' && Platform.OS === 'web';
  const hasAdminAccess = isAdminSession || (!!currentUser && !!currentUser.isSubAdmin);
  const isAuthenticated = !!currentUser || isAdminSession;

  // ---- Accounts & authentication ----
  const registerAccount = async (data) => {
    const email = normalizeEmail(data.email);
    if (accounts.some((a) => normalizeEmail(a.email) === email)) {
      return { success: false, error: t('auth.emailExists') };
    }
    const account = {
      ...data,
      email,
      participantId: generateId('participant'),
      registeredAt: new Date().toISOString(),
    };
    const nextAccounts = [...accounts, account];
    setAccounts(nextAccounts);
    await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(nextAccounts));
    return { success: true, account };
  };

  const persistSession = async (next) => {
    setSession(next);
    if (next) {
      await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(next));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  };

  const login = async (email, password) => {
    const normalized = normalizeEmail(email);
    const account = accounts.find((a) => normalizeEmail(a.email) === normalized);
    if (!account || account.password !== password) {
      return { success: false, error: t('auth.incorrectLogin') };
    }
    await persistSession({ role: 'participant', email: account.email });
    return { success: true };
  };

  const loginAdmin = async (username, password) => {
    if (Platform.OS !== 'web') {
      return { success: false, error: t('auth.adminWebOnly') };
    }
    if (username.trim() !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return { success: false, error: t('auth.incorrectAdminLogin') };
    }
    await persistSession({ role: 'admin' });
    return { success: true };
  };

  const logout = async () => {
    await persistSession(null);
  };

  // Admin-created account for staff (organizers/sub-admins/speakers, etc.) —
  // uses the same registerAccount function as self-registration, just called
  // by the admin on the person's behalf via the Manage Participants screen.

  const deleteAccount = async (email) => {
    if (!hasAdminAccess) return;
    const normalized = normalizeEmail(email);
    const next = accounts.filter((a) => normalizeEmail(a.email) !== normalized);
    setAccounts(next);
    await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(next));
    if (session && session.role === 'participant' && normalizeEmail(session.email) === normalized) {
      await persistSession(null);
    }
  };

  // Admin editing an existing participant/staff account — including their
  // role, sub-admin flag, session picks, or resetting their password.
  const updateAccount = async (originalEmail, changes) => {
    if (!hasAdminAccess) return { success: false, error: t('auth.notAuthorized') };
    const normalizedOriginal = normalizeEmail(originalEmail);
    const idx = accounts.findIndex((a) => normalizeEmail(a.email) === normalizedOriginal);
    if (idx === -1) return { success: false, error: t('auth.participantNotFound') };

    const nextEmail = changes.email ? normalizeEmail(changes.email) : accounts[idx].email;
    if (
      nextEmail !== normalizedOriginal &&
      accounts.some((a) => normalizeEmail(a.email) === nextEmail)
    ) {
      return { success: false, error: t('auth.emailInUse') };
    }

    const updated = { ...accounts[idx], ...changes, email: nextEmail };
    if (!changes.password) {
      updated.password = accounts[idx].password; // keep existing password if left blank
    }

    const next = [...accounts];
    next[idx] = updated;
    setAccounts(next);
    await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(next));

    // Keep an active session pointed at the right account if it was edited.
    if (session && session.role === 'participant' && normalizeEmail(session.email) === normalizedOriginal) {
      await persistSession({ role: 'participant', email: nextEmail });
    }
    return { success: true, account: updated };
  };

  // ---- Favorites (personal schedule) — any logged-in participant's own data ----
  const toggleFavorite = async (sessionId) => {
    setFavorites((prev) => {
      const next = prev.includes(sessionId)
        ? prev.filter((id) => id !== sessionId)
        : [...prev, sessionId];
      AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(next));
      return next;
    });
  };

  // ---- Announcements (admin only) ----
  // audience: { type: 'all' } | { type: 'session', sessionId } | { type: 'role', role }
  const addAnnouncement = async (title, body, audience = { type: 'all' }, priority = 'normal') => {
    if (!hasAdminAccess) return null;
    const newItem = {
      id: generateId('a'),
      title,
      body,
      audience,
      timestamp: new Date().toISOString(),
      priority,
    };
    setAnnouncements((prev) => {
      const next = [newItem, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(next));
      return next;
    });
    // Notifications need a plain string; localize() picks the admin's
    // current language when title/body are { en, cs } (new announcements),
    // and passes a legacy plain-string announcement through unchanged.
    await scheduleLocalNotification(localize(title), localize(body));
    return newItem;
  };

  const deleteAnnouncement = (id) => {
    if (!hasAdminAccess) return;
    setAnnouncements((prev) => {
      const next = prev.filter((a) => a.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(next));
      return next;
    });
  };

  // ---- Program management (admin only) ----
  const persistSessions = (next) => {
    setSessions(next);
    AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(next));
  };

  const addSession = (session) => {
    if (!hasAdminAccess) return null;
    const newItem = { ...session, id: generateId('s') };
    persistSessions([...sessions, newItem]);
    return newItem;
  };

  const updateSession = (id, changes) => {
    if (!hasAdminAccess) return;
    persistSessions(sessions.map((s) => (s.id === id ? { ...s, ...changes, updatedAt: new Date().toISOString() } : s)));
  };

  const deleteSession = (id) => {
    if (!hasAdminAccess) return;
    persistSessions(sessions.filter((s) => s.id !== id));
  };

  // ---- Speaker management (admin only) ----
  const persistSpeakers = (next) => {
    setSpeakers(next);
    AsyncStorage.setItem(STORAGE_KEYS.SPEAKERS, JSON.stringify(next));
  };

  const addSpeaker = (speaker) => {
    if (!hasAdminAccess) return null;
    const newItem = { ...speaker, id: generateId('sp') };
    persistSpeakers([...speakers, newItem]);
    return newItem;
  };

  const updateSpeaker = (id, changes) => {
    if (!hasAdminAccess) return;
    persistSpeakers(speakers.map((s) => (s.id === id ? { ...s, ...changes } : s)));
  };

  const deleteSpeaker = (id) => {
    if (!hasAdminAccess) return;
    persistSpeakers(speakers.filter((s) => s.id !== id));
  };

  // ---- Organizational info management (admin only) ----
  const updateOrgInfo = (changes) => {
    if (!hasAdminAccess) return;
    setOrgInfo((prev) => {
      const next = { ...prev, ...changes };
      AsyncStorage.setItem(STORAGE_KEYS.ORG_INFO, JSON.stringify(next));
      return next;
    });
  };

  // ---- Event details management (admin only) — conference name, dates,
  // location, tagline shown on Welcome/Home. Seeded from src/data/event.js. ----
  const updateEvent = (changes) => {
    if (!hasAdminAccess) return;
    setEvent((prev) => {
      const next = { ...prev, ...changes };
      AsyncStorage.setItem(STORAGE_KEYS.EVENT, JSON.stringify(next));
      return next;
    });
  };

  // ---- Materials & documents management (admin only) ----
  const persistMaterials = (next) => {
    setMaterials(next);
    AsyncStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(next));
  };

  const addMaterial = (material) => {
    if (!hasAdminAccess) return null;
    const newItem = { ...material, id: generateId('mat') };
    persistMaterials([...materials, newItem]);
    return newItem;
  };

  const updateMaterial = (id, changes) => {
    if (!hasAdminAccess) return;
    persistMaterials(materials.map((m) => (m.id === id ? { ...m, ...changes } : m)));
  };

  const deleteMaterial = (id) => {
    if (!hasAdminAccess) return;
    persistMaterials(materials.filter((m) => m.id !== id));
  };

  // ---- Sponsor banner management (admin only) ----
  const persistSponsors = (next) => {
    setSponsors(next);
    AsyncStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(next));
  };

  const addSponsor = (sponsor) => {
    if (!hasAdminAccess) return null;
    const newItem = { ...sponsor, id: generateId('spn') };
    persistSponsors([...sponsors, newItem]);
    return newItem;
  };

  const updateSponsor = (id, changes) => {
    if (!hasAdminAccess) return;
    persistSponsors(sponsors.map((s) => (s.id === id ? { ...s, ...changes } : s)));
  };

  const deleteSponsor = (id) => {
    if (!hasAdminAccess) return;
    persistSponsors(sponsors.filter((s) => s.id !== id));
  };

  // ---- Terms of Participation management (admin only) ----
  const updateTermsText = (text) => {
    if (!hasAdminAccess) return;
    setTermsText(text);
    AsyncStorage.setItem(STORAGE_KEYS.TERMS_TEXT, JSON.stringify(text));
  };

  // ---- Check-in (admin scanning a badge QR) ----
  const recordCheckIn = (participant) => {
    if (!hasAdminAccess) return null;
    const entry = { ...participant, checkedInAt: new Date().toISOString() };
    setCheckIns((prev) => {
      const next = [entry, ...prev.filter((c) => c.participantId !== participant.participantId)];
      AsyncStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(next));
      return next;
    });
    return entry;
  };

  const value = {
    loading,
    language,
    setLanguage,
    t,
    localize,
    isAuthenticated,
    currentUser,
    isAdminSession,
    hasAdminAccess,
    accounts,
    registerAccount,
    login,
    loginAdmin,
    logout,
    deleteAccount,
    updateAccount,
    favorites,
    toggleFavorite,
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    sessions,
    addSession,
    updateSession,
    deleteSession,
    speakers,
    addSpeaker,
    updateSpeaker,
    deleteSpeaker,
    orgInfo,
    updateOrgInfo,
    event,
    updateEvent,
    materials,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    sponsors,
    addSponsor,
    updateSponsor,
    deleteSponsor,
    termsText,
    updateTermsText,
    checkIns,
    recordCheckIn,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
